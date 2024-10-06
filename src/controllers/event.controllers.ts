import { Context } from "hono";
import ApiResponse from "../utils/ApiResponse";
import { initPrismaClient } from "../utils/prisma";
import { EventError } from "../errors/EventError";
import { handleError } from "../errors/ErrorHandler";

export const getConfirmedAndWaitlist = async (c: Context) => {
    try {
        const prisma = initPrismaClient(c);
        const eventId = c.req.param('id');

        const confirmedList = await prisma.confirmedList.findMany({
            where: {
                eventId: Number(eventId),
                cancelled: false
            },
            select: {
                participantId: true
            }
        });

        const waitList = await prisma.waitList.findMany({
            where: {
                eventId: Number(eventId),
                cancelled: false
            },
            select: {
                participantId: true
            }
        })

        console.log("confirmedList: ", !confirmedList.length);

        if (!confirmedList || !waitList) throw EventError.failedToFetchList();
        if (!confirmedList.length && !waitList.length) throw EventError.noParticipants();
        if (!waitList.length) {
            return c.json(new ApiResponse(200, { confirmedList }, "Confirmed list fetched successfully. Waitlist is empty."), 200);
        }

        return c.json(new ApiResponse(200, { confirmedList, waitList }, "Confirmed and Waitlist fetched successfully"), 200);
    } catch (error: any) {
        return handleError(c, error);
    }
}