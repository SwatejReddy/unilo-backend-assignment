import { Hono } from "hono"
import { getConfirmedAndWaitlist } from "../controllers/event.controllers"
import { loginCheck } from "../middlewares/auth.middleware"

export const eventRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        SECRET_KEY: string
    }
}>()


eventRouter.use('/getConfirmedAndWaitList/:id').get(loginCheck, getConfirmedAndWaitlist)