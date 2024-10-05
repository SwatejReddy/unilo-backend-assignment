import { Hono } from "hono"
import { participantAccessCheck } from "../middlewares/auth.middleware"
import { joinEvent } from "../controllers/participant.controllers"

export const participantRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        SECRET_KEY: string
    }
}>()

participantRouter.use('/event/register/:id').post(participantAccessCheck, joinEvent)