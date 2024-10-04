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
        const dataIsValid = addEventInput.safeParse(body);

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
    } catch (error) {

    }
}

// put role inside jwt token in cookie.
// put two middlewares, one for admin and one for participant and check roles.
// use these middlewares for respective routes so no need of checking roles in controllers.