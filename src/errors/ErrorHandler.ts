import { Context } from "hono";
import { EventError } from "./EventError";
import ApiResponse from "../utils/ApiResponse";
import { ApiError } from "./ApiError";
import { UserAuthError } from "./UserAuthError";

export const handleError = (c: Context, error: EventError | ApiError | UserAuthError) => {
    if (error instanceof EventError) {
        return c.json(
            new ApiResponse(error.statusCode, {}, error.message),
            { status: error.statusCode }
        )
    }
    if (error instanceof ApiError) {
        return c.json(
            new ApiResponse(error.statusCode, error.details, error.message),
            { status: error.statusCode }
        )
    }
    if (error instanceof UserAuthError) {
        return c.json(
            new ApiResponse(error.statusCode, error.details, error.message),
            { status: error.statusCode }
        )
    }
    console.error("Unexpected error: ", error);
    return c.json(
        new ApiResponse(500, {}, "An unexpected error occurred"), 500
    )
}