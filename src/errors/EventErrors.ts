import { Context } from "hono";
import ApiResponse from "../utils/ApiResponse";

export class EventError extends Error {
    constructor(public code: string, public statusCode: number, message: string) {
        super(message);
        this.name = "EventError";
    }

    static alreadyRegistered(list: "confirmed" | "waitlist") {
        return new EventError(
            `ALREADY_REGISTERED_${list.toUpperCase()}`,
            400,
            `You are already registered and in the ${list}`
        );
    }

    static eventNotFound() {
        return new EventError("EVENT_NOT_FOUND", 404, "Event does not exist");
    }

    static notRegistered() {
        return new EventError("NOT_REGISTERED", 400, "You are not registered for this event");
    }

    static unexpectedError() {
        return new EventError("UNEXPECTED_ERROR", 500, "An unexpected error occurred");
    }
}

export const handleEventError = (c: Context, error: EventError) => {
    if (error instanceof EventError) {
        return c.json(
            new ApiResponse(error.statusCode, {}, error.message),
            { status: error.statusCode }
        )
    }
    console.error("Unexpected error: ", error);
    return c.json(
        new ApiResponse(500, {}, "An unexpected error occurred"), 500
    )
}
