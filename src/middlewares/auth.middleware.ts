import { Context, Next } from "hono";
import {
    getCookie
} from 'hono/cookie';
import { verifyJwtToken } from "../utils/jwt";
import ApiResponse from "../utils/ApiResponse";
import { Role } from "../schemas/types";

const authenticateUser = async (c: Context, requiredRole?: Role) => {
    const jwt = getCookie(c, 'jwt');
    console.log("Cookie: ", jwt);

    if (!jwt) {
        return new ApiResponse(401, { message: 'Unauthorized' }, "Please login first");
    }

    const payload = await verifyJwtToken(c, jwt);
    if (!payload) {
        return new ApiResponse(401, { message: 'Unauthorized' }, "Incorrect JWT token received");
    }

    if (requiredRole && payload.role !== requiredRole) {
        return new ApiResponse(401, { message: 'Unauthorized' }, `You are not authorized to access this route as ${requiredRole === 'admin' ? 'an' : 'a'} ${requiredRole}.`);
    }

    return { userId: payload.userId };
}

export const loginCheck = async (c: Context, next: Next) => {
    const result = await authenticateUser(c);

    // if not logged in or incorrect jwt token return 401
    if (result instanceof ApiResponse) {
        return c.json(result, 401);
    }

    // set userId in context
    c.set('userId', result.userId);

    await next();
}

export const adminAccessCheck = async (c: Context, next: Next) => {
    const result = await authenticateUser(c, 'admin');

    // if not logged in or incorrect jwt token return 401
    if (result instanceof ApiResponse) {
        return c.json(result, 401);
    }

    // set userId in context
    c.set('userId', result.userId);
    await next();
}

export const participantAccessCheck = async (c: Context, next: Next) => {
    const result = await authenticateUser(c, 'participant');

    // if not logged in or incorrect jwt token return 401
    if (result instanceof ApiResponse) {
        return c.json(result, 401);
    }

    // set userId in context
    c.set('userId', result.userId);
    await next();
}
