import { Hono } from "hono"
import { participantAccessCheck } from "../middlewares/auth.middleware"
import { cancelEventRegistration, joinEvent } from "../controllers/participant.controllers"

export const participantRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        SECRET_KEY: string
    }
}>()

participantRouter.use('/event/register/:id').post(participantAccessCheck, joinEvent)
participantRouter.use('/event/cancel-registration/:id').post(participantAccessCheck, cancelEventRegistration)