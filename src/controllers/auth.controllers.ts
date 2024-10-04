import { Context } from "hono";
import { z } from "zod"
import { adminSignupInput, loginInput, participantSignupInput } from "../schemas/zodSchemas";
import ApiResponse from "../utils/ApiResponse";
import { generateSalt, hashPassword, verifyPassword } from "../utils/Hashing";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { generateJwtToken } from "../utils/jwt";
import { setCookie } from "hono/cookie";

export const adminSignup = async (c: Context) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const body = await c.req.json();
        const dataIsValid = adminSignupInput.safeParse(body);

        // if the data is not valid, return an error response
        if (!dataIsValid.success) {
            return c.json(new ApiResponse(400, { errors: dataIsValid.error.errors }, "Invalid Inputs"), 400);
        }

        // create a salt
        const salt = generateSalt();

        // hash the password using the salt
        const hashedPassword = await hashPassword(dataIsValid.data.password, salt);

        // check if the admin already exists
        const adminExists = await prisma.admin.findFirst({
            where: {
                OR: [
                    { email: dataIsValid.data.email },
                    { username: dataIsValid.data.username }
                ]
            }
        })

        // if the admin already exists, return an error response
        if (adminExists) {
            return c.json(new ApiResponse(400, {}, "Admin already exists"), 400);
        }

        // if admin doesn't exist, create the admin
        const admin = await prisma.admin.create({
            data: {
                name: dataIsValid.data.name,
                email: dataIsValid.data.email,
                username: dataIsValid.data.username,
                password: hashedPassword,
                salt: salt
            }
        })

        if (!admin) {
            return c.json(new ApiResponse(500, {}, "An error occurred while creating the admin"), 500);
        }

        return c.json(new ApiResponse(200, {}, "Admin Signup Successful"), 200);
    } catch (error) {
        return c.json(new ApiResponse(500, {}, "An error occurred while creating the admin"), 500);
    }
}

export const adminLogin = async (c: Context) => {
    try {
        console.log("c.env.DATABASE_URL: ", c.env.DATABASE_URL);
        console.log("c.env.SECRET_KEY: ", c.env.SECRET_KEY);
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const body = await c.req.json();
        const dataIsValid = loginInput.safeParse(body);

        if (!dataIsValid.success) {
            return c.json(new ApiResponse(400, { errors: dataIsValid.error.errors }, "Invalid Inputs"), 400);
        }

        const admin = await prisma.admin.findFirst({
            where: {
                username: dataIsValid.data.username
            }
        })

        if (!admin) {
            return c.json(new ApiResponse(404, {}, "Admin not found"), 404);
        }

        const passwordIsValid = await verifyPassword(dataIsValid.data.password, admin.password, admin.salt);

        if (!passwordIsValid) {
            return c.json(new ApiResponse(401, {}, "Invalid Credentials"), 401);
        }

        const token = await generateJwtToken(c, { id: admin.id, username: admin.username, email: admin.email, role: "admin" });

        setCookie(c, 'jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        return c.json(new ApiResponse(200, { token, admin }, "Admin Login Successful"), 200);

    } catch (error) {
        return c.json(new ApiResponse(500, {}, "An error occurred while logging in"), 500);
    }
}

export const participantSignup = async (c: Context) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const body = await c.req.json();
        const dataIsValid = participantSignupInput.safeParse(body);

        // if the data is not valid, return an error response
        if (!dataIsValid.success) {
            return c.json(new ApiResponse(400, { errors: dataIsValid.error.errors }, "Invalid Inputs"), 400);
        }

        // create a salt
        const salt = generateSalt();

        // hash the password using the salt
        const hashedPassword = await hashPassword(dataIsValid.data.password, salt);

        // check if the participant already exists
        const participantExists = await prisma.participant.findFirst({
            where: {
                OR: [
                    { email: dataIsValid.data.email },
                    { username: dataIsValid.data.username }
                ]
            }
        })

        // if the admin already exists, return an error response
        if (participantExists) {
            return c.json(new ApiResponse(400, {}, "Participant already exists"), 400);
        }

        // if admin doesn't exist, create the admin
        const participant = await prisma.participant.create({
            data: {
                name: dataIsValid.data.name,
                email: dataIsValid.data.email,
                username: dataIsValid.data.username,
                password: hashedPassword,
                salt: salt
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true
            }
        })

        if (!participant) {
            return c.json(new ApiResponse(500, {}, "An error occurred while creating the participant"), 500);
        }

        return c.json(new ApiResponse(200, { participant }, "Participant Signup Successful"), 200);
    } catch (error) {
        return c.json(new ApiResponse(500, {}, "An error occurred while creating the participant"), 500);
    }
}

export const participantLogin = async (c: Context) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const body = await c.req.json();
        const dataIsValid = loginInput.safeParse(body);

        if (!dataIsValid.success) {
            return c.json(new ApiResponse(400, { errors: dataIsValid.error.errors }, "Invalid Inputs"), 400);
        }

        const participant = await prisma.participant.findFirst({
            where: {
                username: dataIsValid.data.username
            }
        })

        if (!participant) {
            return c.json(new ApiResponse(404, {}, "Participant not found"), 404);
        }

        const passwordIsValid = await verifyPassword(dataIsValid.data.password, participant.password, participant.salt);

        if (!passwordIsValid) {
            return c.json(new ApiResponse(401, {}, "Invalid Credentials"), 401);
        }

        const token = await generateJwtToken(c, { id: participant.id, username: participant.username, email: participant.email, role: "participant" });

        setCookie(c, 'jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        return c.json(new ApiResponse(200, { token, participant }, "Login Successful"), 200);
    } catch (error) {
        return c.json(new ApiResponse(500, {}, "An error occurred while logging in"), 500);
    }
}

export const logout = async (c: Context) => {
    // clear cookie 'jwt'
    setCookie(c, 'jwt', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(0)
    });
    return c.json(new ApiResponse(200, {}, "Participant logout Successful"), 200);
}