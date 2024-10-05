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
                adminId: c.get('userId')
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
        const body = await c.req.json();
        const id = c.req.param('id');
        body.date = new Date(body.date);
        const dataIsValid = addEventInput.safeParse(body);

        if (!dataIsValid.success) {
            return c.json(new ApiResponse(400, { errors: dataIsValid.error.errors }, "Invalid Inputs"), 400);
        }

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        if (!prisma) {
            return c.json(new ApiResponse(500, {}, "Couldn't connect to the database"), 500);
        }

        // only if deleted is false:
        const event = await prisma.event.update({
            where: {
                id: Number(id),
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

        console.log("Eevent: ", event);

        return c.json(new ApiResponse(200, { event }, "Event updated successfully"), 200);
    } catch (error: any) {

        if (error.code === 'P2025') {
            return c.json(new ApiResponse(404, {}, "Can't update the event as it no longer exists"), 404);
        }

        return c.json(new ApiResponse(500, {}, "Couldn't update the event"), 500);
    }
}
