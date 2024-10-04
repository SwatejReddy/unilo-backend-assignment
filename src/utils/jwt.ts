import { Context } from "hono";
import { sign, verify } from "hono/jwt";

export const generateJwtToken = async (c: Context, payload: any) => {
    console.log(c.env.SECRET_KEY);
    return await sign(payload, c.env.SECRET_KEY);
}

export const verifyJwtToken = async (c: Context, token: string) => {
    return await verify(token, c.env.SECRET_KEY);
}