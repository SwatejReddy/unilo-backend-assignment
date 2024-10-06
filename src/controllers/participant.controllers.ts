import { Context } from "hono";
import ApiResponse from "../utils/ApiResponse";
import { initPrismaClient } from "../utils/prisma";
import { EventError } from "../errors/EventError";
import { handleError } from "../errors/ErrorHandler";


export const joinEvent = async (c: Context) => {
    try {
        const eventId = c.req.param('id');
        const participantId = c.get('userId');
        const prisma = initPrismaClient(c);

        // check if the event exists
        const event = await prisma.event.findFirst({
            where: {
                id: parseInt(eventId),
                deleted: false
            }
        })

        // if the event doesn't exist, return an error response
        if (!event) throw EventError.eventNotFound();

        const userInList = await isParticipantRegistered(prisma, event.id, participantId);

        if (userInList) throw EventError.alreadyRegistered(userInList as "confirmed" | "waitlist");

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
        return handleError(c, error);
    }
}

export const cancelEventRegistration = async (c: Context) => {
    try {
        const participantId = c.get('userId');
        const eventId = c.req.param('id');
        const prisma = initPrismaClient(c);

        const event = await prisma.event.findFirst({
            where: {
                id: parseInt(eventId),
                deleted: false
            }
        })

        if (!event) throw EventError.eventNotFound();

        const userInList = await isParticipantRegistered(prisma, event.id, participantId);

        if (!userInList) throw EventError.notRegistered();

        // check if the user is in the confirmed list or waitlist
        if (userInList == IN_CONFIRMED_LIST) {
            await prisma.$transaction(async (prisma) => {
                // remove the participant from the confirmed list - to avoid race conditions
                const confirmedParticipant = await prisma.confirmedList.findFirst({
                    where: { eventId: Number(eventId), participantId: Number(participantId), cancelled: false }
                });

                if (!confirmedParticipant) throw EventError.notRegistered();

                await prisma.confirmedList.updateMany({
                    where: {
                        eventId: Number(eventId),
                        participantId: Number(participantId)
                    },
                    data: { cancelled: true }
                });

                // decrement the confirmed count in the event
                await prisma.event.update({
                    where: { id: Number(eventId) },
                    data: { confirmedCount: { decrement: 1 } }
                });

                // check if there is any user in the waitlist
                const waitlist = await prisma.waitList.findFirst({
                    where: { eventId: Number(eventId), cancelled: false },
                    orderBy: { createdAt: 'asc' }
                });

                // if there is a user in the waitlist, move the first person from the waitlist to the confirmed list
                if (waitlist) {
                    await prisma.confirmedList.create({
                        data: {
                            eventId: Number(eventId),
                            participantId: waitlist.participantId
                        }
                    });

                    await prisma.waitList.update({
                        where: { id: waitlist.id },
                        data: { cancelled: true }
                    });
                }
            });

            return c.json(new ApiResponse(200, {}, "Your registration from the confirmed list has been cancelled successfully."), 200);
        }
        else if (userInList == IN_WAIT_LIST) {
            await prisma.$transaction(async (prisma) => {
                // extra check to avoid race conditions
                const waitlistParticipant = await prisma.waitList.findFirst({
                    where: { eventId: Number(eventId), participantId: Number(participantId), cancelled: false }
                });

                // if the user is not in the waitlist, return an error response
                if (!waitlistParticipant) throw EventError.notRegistered();

                // remove the participant from the waitlist
                await prisma.waitList.updateMany({
                    where: {
                        eventId: Number(eventId),
                        participantId: Number(participantId)
                    },
                    data: { cancelled: true }
                });
            });
            return c.json(new ApiResponse(200, {}, "Your registration from the waitlist has been cancelled successfully"), 200);
        }
    } catch (error: any) {
        return handleError(c, error);
    }
}

const IN_CONFIRMED_LIST = "confirmed list";
const IN_WAIT_LIST = "wait list";

const isParticipantRegistered = async (prisma: any, eventId: number, participantId: number) => {
    const confirmedParticipant = await prisma.confirmedList.findFirst({
        where: { eventId, participantId, cancelled: false },
    });
    const waitlistParticipant = await prisma.waitList.findFirst({
        where: { eventId, participantId, cancelled: false },
    });

    if (confirmedParticipant) return IN_CONFIRMED_LIST
    if (waitlistParticipant) return IN_WAIT_LIST
    return false;
};