import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";
import { addEventInput } from "../schemas/zodSchemas";
import ApiResponse from "../utils/ApiResponse";
import { initPrismaClient } from "../utils/prisma";
import { ApiError } from "../errors/ApiError";
import { handleError } from "../errors/ErrorHandler";
import { EventError } from "../errors/EventError";

export const createEvent = async (c: Context) => {
    try {
        // initiate a prisma client
        const prisma = initPrismaClient(c);

        // get the request body and validate it
        const adminId = c.get('userId');
        const body = await c.req.json();
        body.date = new Date(body.date);
        const dataIsValid = addEventInput.safeParse(body);

        // if the data is not valid, return an error response
        if (!dataIsValid.success) throw ApiError.validationFailed("Invalid Inputs", dataIsValid.error.errors);

        // create new event 
        const event = await prisma.event.create({
            data: {
                title: dataIsValid.data.title,
                description: dataIsValid.data.description,
                date: dataIsValid.data.date,
                location: dataIsValid.data.location,
                maxParticipants: dataIsValid.data.maxParticipants,
                adminId: adminId
            }
        })

        if (!event) throw EventError.failedToCreateEvent();

        // return the event
        return c.json(new ApiResponse(200, { event }, "Event created successfully"), 200);

    } catch (error: any) {
        return handleError(c, error);
    }
}

export const updateEvent = async (c: Context) => {
    try {
        const eventId = c.req.param('id');
        const adminId = c.get('userId');
        const body = await c.req.json();

        body.date = new Date(body.date);
        const dataIsValid = addEventInput.safeParse(body);

        // if the data is not valid, return an error response
        if (!dataIsValid.success) {
            throw ApiError.validationFailed("Invalid Inputs", dataIsValid.error.errors);
        }

        // initiate a prisma client
        const prisma = initPrismaClient(c);
        if (!prisma) throw ApiError.databaseConnectionError();

        // check if the event exists
        const eventExists = await prisma.event.findFirst({
            where: {
                id: Number(eventId)
            }
        })

        // if the event doesn't exist, return an error response
        if (!eventExists) throw EventError.eventNotFound();

        // if the event exists but the adminId is different, return an error response
        if (eventExists.adminId !== adminId) throw ApiError.unauthorized();

        // if the event is deleted, return an error response
        if (eventExists.deleted) throw EventError.eventNotFound();

        // update the event
        const event = await prisma.event.update({
            where: {
                id: Number(eventId),
                adminId: adminId,
                deleted: false
            },
            data: {
                title: dataIsValid.data.title,
                description: dataIsValid.data.description,
                date: dataIsValid.data.date,
                location: dataIsValid.data.location,
                maxParticipants: dataIsValid.data.maxParticipants
            }
        })

        return c.json(new ApiResponse(200, { event }, "Event updated successfully"), 200);
    } catch (error: any) {
        return handleError(c, error);
    }
}