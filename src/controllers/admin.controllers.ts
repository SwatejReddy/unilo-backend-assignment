import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";
import { addEventInput } from "../schemas/zodSchemas";
import ApiResponse from "../utils/ApiResponse";

export const createEvent = async (c: Context) => {
    try {
        // initiate a prisma client
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        // get the request body and validate it
        const adminId = c.get('userId');
        const body = await c.req.json();
        body.date = new Date(body.date);
        const dataIsValid = addEventInput.safeParse(body);

        console.log(dataIsValid);

        // if the data is not valid, return an error response
        if (!dataIsValid.success) {
            return c.json(new ApiResponse(400, { errors: dataIsValid.error.errors }, "Invalid Inputs"), 400);
        }

        // create event 

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

        if (!event) {
            return c.json(new ApiResponse(500, {}, "Couldn't create the event"), 500);
        }

        // return the event
        return c.json(new ApiResponse(200, { event }, "Event created successfully"), 200);

    } catch (error) {
        return c.json(new ApiResponse(500, {}, "Couldn't create the event"), 500);
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
            return c.json(new ApiResponse(400, { errors: dataIsValid.error.errors }, "Invalid Inputs"), 400);
        }

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        if (!prisma) {
            return c.json(new ApiResponse(500, {}, "Couldn't connect to the database"), 500);
        }

        // check if the event exists
        const eventExists = await prisma.event.findFirst({
            where: {
                id: Number(eventId)
            }
        })

        // if the event doesn't exist, return an error response
        if (!eventExists) {
            return c.json(new ApiResponse(404, {}, "Event not found"), 404);
        }

        // if the event exists but the adminId is different, return an error response
        if (eventExists.adminId !== adminId) {
            return c.json(new ApiResponse(403, {}, "You are not authorized to update this event"), 403);
        }

        // if the event is deleted, return an error response
        if (eventExists.deleted) {
            return c.json(new ApiResponse(404, {}, "Can't update the event as it no longer exists"), 404);
        }

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
        return c.json(new ApiResponse(500, {}, "Couldn't update the event"), 500);
    }
}