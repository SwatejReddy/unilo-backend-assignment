import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";
import ApiResponse from "../utils/ApiResponse";

const ALREADY_REGISTERED_CONFIRMED = "ALREADY_REGISTERED_CONFIRMED_LIST";
const ALREADY_REGISTERED_WAITLIST = "ALREADY_REGISTERED_WAITLIST";

const isParticipantRegistered = async (prisma: any, eventId: number, participantId: number) => {
    const confirmedParticipant = await prisma.confirmedList.findFirst({
        where: { eventId, participantId, cancelled: false },
    });
    const waitlistParticipant = await prisma.waitList.findFirst({
        where: { eventId, participantId, cancelled: false },
    });

    if (confirmedParticipant) {
        throw new Error(ALREADY_REGISTERED_CONFIRMED);
    }
    if (waitlistParticipant) {
        throw new Error(ALREADY_REGISTERED_WAITLIST);
    }
};


export const joinEvent = async (c: Context) => {
    try {
        const eventId = c.req.param('id');
        const participantId = c.get('userId');

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        // check if the event exists
        const event = await prisma.event.findFirst({
            where: {
                id: parseInt(eventId),
                deleted: false
            }
        })

        // if the event doesn't exist, return an error response
        if (!event) {
            return c.json(new ApiResponse(404, {}, "Event doesn't exist"), 404);
        }

        await isParticipantRegistered(prisma, event.id, participantId);

        let responseMessage;

        // check the confirmed count and decide to add the participant to confirmed list or waitlist:
        if (event.confirmedCount < event.maxParticipants) {
            const result = await prisma.$transaction(async (prisma) => {
                // add the participant to the confirmed list
                const eventRegistration = await prisma.confirmedList.create({
                    data: {
                        eventId: Number(eventId),
                        participantId: Number(participantId)
                    }
                });

                // increment the confirmed count in the event
                const updatedEvent = await prisma.event.update({
                    where: { id: Number(eventId) },
                    data: { confirmedCount: { increment: 1 } }
                });

                return { eventRegistration, updatedEvent };
            });

            responseMessage = "Added to the confirmed list.";
        }
        else {
            // add the participant to the waitlist
            const result = await prisma.$transaction(async (prisma) => {

                // add the participant to the waitlist
                const eventRegistration = await prisma.waitList.create({
                    data: {
                        eventId: Number(eventId),
                        participantId: Number(participantId)
                    }
                });

                return { eventRegistration };
            });

            responseMessage = "Added to the waitlist.";
        }

        return c.json(new ApiResponse(200, {}, responseMessage), 200);
    } catch (error: any) {
        if (error.message === ALREADY_REGISTERED_CONFIRMED) {
            return c.json(new ApiResponse(400, {}, "You already registered for the event and are in the confirmed list"), 400);
        }
        else if (error.message === ALREADY_REGISTERED_WAITLIST) {
            return c.json(new ApiResponse(400, {}, "You already registered for the event and are in the waitlist"), 400);
        }
        return c.json(new ApiResponse(500, {}, "An error occurred while registering for the event"), 500);
    }
}

// if cancelled from confirmed list then decrement the confirmed count in event.

// dont consider the soft deleted ones in any api.