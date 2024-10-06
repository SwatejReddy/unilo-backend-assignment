import { Context } from "hono";
import ApiResponse from "../utils/ApiResponse";
import { initPrismaClient } from "../utils/prisma";

const IN_CONFIRMED_LIST = "ALREADY_REGISTERED_CONFIRMED_LIST";
const IN_WAIT_LIST = "ALREADY_REGISTERED_WAITLIST";

const isParticipantRegistered = async (prisma: any, eventId: number, participantId: number) => {
    const confirmedParticipant = await prisma.confirmedList.findFirst({
        where: { eventId, participantId, cancelled: false },
    });
    const waitlistParticipant = await prisma.waitList.findFirst({
        where: { eventId, participantId, cancelled: false },
    });

    if (confirmedParticipant) {
        return IN_CONFIRMED_LIST
    }
    if (waitlistParticipant) {
        return IN_WAIT_LIST
    }
    return false;
};

// class EventError extends Error {
//     constructor(public code: string, public statusCode: number, message: string) {
//         super(message);
//         this.name = "EventError";
//     }
// }

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
        if (!event) {
            return c.json(new ApiResponse(404, {}, "Event doesn't exist"), 404);
        }

        const userInList = await isParticipantRegistered(prisma, event.id, participantId);

        if (userInList) {
            throw new Error(userInList);
        }

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
        if (error.message === IN_CONFIRMED_LIST) {
            return c.json(new ApiResponse(400, {}, "You already registered for the event and are in the confirmed list"), 400);
        }
        else if (error.message === IN_WAIT_LIST) {
            return c.json(new ApiResponse(400, {}, "You already registered for the event and are in the waitlist"), 400);
        }
        return c.json(new ApiResponse(500, {}, "An error occurred while registering for the event"), 500);
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

        if (!event) {
            return c.json(new ApiResponse(404, {}, "Event doesn't exist"), 404);
        }

        const userInList = await isParticipantRegistered(prisma, event.id, participantId);
        // check if the user is in the confirmed list or waitlist
        if (userInList == IN_CONFIRMED_LIST) {
            await prisma.$transaction(async (prisma) => {
                // remove the participant from the confirmed list - to avoid race conditions
                const confirmedParticipant = await prisma.confirmedList.findFirst({
                    where: { eventId: Number(eventId), participantId: Number(participantId), cancelled: false }
                });

                if (!confirmedParticipant) {
                    return c.json(new ApiResponse(400, {}, "You are not registered for this event"), 400);
                }

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

                // extra check to avoid race conditions when a user in the waitlist is trying to cancel the registration and the user is already moved to the confirmed list because of another user's cancellation
                const waitlistParticipant = await prisma.waitList.findFirst({
                    where: { eventId: Number(eventId), participantId: Number(participantId), cancelled: false }
                });

                // if the user is not in the waitlist, return an error response
                if (!waitlistParticipant) {
                    return c.json(new ApiResponse(400, {}, "You are not registered for this event"), 400);
                }

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
        else {
            return c.json(new ApiResponse(400, {}, "You are not registered for this event"), 400);
        }
    } catch (error) {
        return c.json(new ApiResponse(500, {}, "An error occurred while cancelling the event"), 500);
    }
}