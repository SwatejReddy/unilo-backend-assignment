import { Context } from "hono";
import { sign, verify } from "hono/jwt";

export const generateJwtToken = async (c: Context, payload: any) => {
    return await sign(payload, c.env.SECRET_KEY);
}

export const verifyJwtToken = async (c: Context, token: string) => {
    // return await verify(token, c.env.SECRET_KEY);
    try {
        const payload = await verify(token, c.env.SECRET_KEY);
        return payload as { userId: number; role: string };
    } catch (error) {
        console.error("JWT verification error:", error);
        return null;
    }
}