import { Hono } from "hono"
import { createEvent, updateEvent } from "../controllers/admin.controllers"
import { adminAccessCheck } from "../middlewares/auth.middleware"

export const adminRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        SECRET_KEY: string
    }
}>()

adminRouter.use('/event/create').post(adminAccessCheck, createEvent);
adminRouter.use('/event/update/:id').put(adminAccessCheck, updateEvent)