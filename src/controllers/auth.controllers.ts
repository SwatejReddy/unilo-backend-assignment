import { Context } from "hono";
import { z } from "zod"
import { adminSignupInput, loginInput, participantSignupInput } from "../schemas/zodSchemas";
import ApiResponse from "../utils/ApiResponse";
import { generateSalt, hashPassword, verifyPassword } from "../utils/Hashing";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { generateJwtToken } from "../utils/jwt";
import { setCookie } from "hono/cookie";
import { initPrismaClient } from "../utils/prisma";
import { ApiError } from "../errors/ApiError";
import { UserAuthError } from "../errors/UserAuthError";
import { handleError } from "../errors/ErrorHandler";
import { use } from "hono/jsx";

export const adminSignup = async (c: Context) => {
    try {
        const prisma = initPrismaClient(c);
        const body = await c.req.json();
        const dataIsValid = adminSignupInput.safeParse(body);

        // if the data is not valid, return an error response
        if (!dataIsValid.success) throw ApiError.validationFailed("Invalid Inputs", dataIsValid.error.errors);

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
        if (adminExists) throw UserAuthError.userExists('admin');

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

        if (!admin) throw UserAuthError.cannotCreateUser('admin');

        return c.json(new ApiResponse(200, {}, "Admin Signup Successful"), 200);
    } catch (error: any) {
        return handleError(c, error);
    }
}

export const adminLogin = async (c: Context) => {
    try {
        console.log("c.env.DATABASE_URL: ", c.env.DATABASE_URL);
        console.log("c.env.SECRET_KEY: ", c.env.SECRET_KEY);
        const prisma = initPrismaClient(c);

        const body = await c.req.json();
        const dataIsValid = loginInput.safeParse(body);

        if (!dataIsValid.success) throw ApiError.validationFailed("Invalid Inputs", dataIsValid.error.errors);

        const admin = await prisma.admin.findFirst({
            where: {
                username: dataIsValid.data.username
            },
        })

        if (!admin) throw UserAuthError.userNotFound('admin');

        const passwordIsValid = await verifyPassword(dataIsValid.data.password, admin.password, admin.salt);

        if (!passwordIsValid) throw UserAuthError.invalidCredentials();

        const token = await generateJwtToken(c, { userId: admin.id, username: admin.username, email: admin.email, role: "admin" });

        setCookie(c, 'jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        return c.json(new ApiResponse(200, {
            token, admin: {
                id: admin.id,
                name: admin.name,
                username: admin.username,
                email: admin.email
            }
        }, "Admin Login Successful"), 200);

    } catch (error: any) {
        return handleError(c, error);
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
        if (!dataIsValid.success) throw ApiError.validationFailed("Invalid Inputs", dataIsValid.error.errors);

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
        if (participantExists) throw UserAuthError.userExists('participant');

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

        if (!participant) throw UserAuthError.cannotCreateUser('participant');

        return c.json(new ApiResponse(200, { participant }, "Participant Signup Successful"), 200);
    } catch (error: any) {
        return handleError(c, error);
    }
}

export const participantLogin = async (c: Context) => {
    try {
        const prisma = initPrismaClient(c);
        const body = await c.req.json();
        const dataIsValid = loginInput.safeParse(body);

        if (!dataIsValid.success) throw ApiError.validationFailed("Invalid Inputs", dataIsValid.error.errors);

        const participant = await prisma.participant.findFirst({
            where: {
                username: dataIsValid.data.username
            }
        })
        if (!participant) throw UserAuthError.userNotFound('participant');

        const passwordIsValid = await verifyPassword(dataIsValid.data.password, participant.password, participant.salt);

        if (!passwordIsValid) throw UserAuthError.invalidCredentials();

        const token = await generateJwtToken(c, { userId: participant.id, username: participant.username, email: participant.email, role: "participant" });

        setCookie(c, 'jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        return c.json(new ApiResponse(200, {
            token, participant: {
                id: participant.id,
                name: participant.name,
                username: participant.username,
                email: participant.email
            }
        }, "Login Successful"), 200);

    } catch (error: any) {
        return handleError(c, error);
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
    return c.json(new ApiResponse(200, {}, "Logout Successful"), 200);
}