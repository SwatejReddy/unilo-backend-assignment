import { Hono } from "hono"
import { adminLogin, adminSignup, participantLogin } from "../controllers/auth.controllers"
import { logout } from "../controllers/auth.controllers"
import { participantSignup } from "../controllers/auth.controllers"
import { loginCheck, participantAccessCheck } from "../middlewares/auth.middleware"

export const authRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        SECRET_KEY: string
    }
}>()

// Admin auth routes
authRouter.use('/admin/signup').post(adminSignup);
authRouter.use('/admin/login').post(adminLogin);

// Participant auth routes
authRouter.use('/participant/signup').post(participantSignup);
authRouter.use('/participant/login').post(participantLogin);

// Logout route
authRouter.use('/logout').post(loginCheck, logout);