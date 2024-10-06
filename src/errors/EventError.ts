import { Context } from "hono";
import ApiResponse from "../utils/ApiResponse";
import { ApiError } from "./ApiError";

export class EventError extends Error {
    constructor(public statusCode: number, message: string, public details: any = {}) {
        super(message);
        this.name = "EventError";
    }

    static alreadyRegistered(list: "confirmed" | "waitlist") {
        return new EventError(
            400,
            `You are already registered and in the ${list}`,
            { code: `ALREADY_REGISTERED_${list.toUpperCase()}` }
        );
    }

    static eventNotFound() {
        return new EventError(404, "Event does not exist", { code: "EVENT_NOT_FOUND" });
    }

    static failedToCreateEvent() {
        return new EventError(500, "Failed to create the event", { code: "FAILED_TO_CREATE" });
    }

    static notRegistered() {
        return new EventError(400, "You are not registered for this event", { code: "NOT_REGISTERED" });
    }

    static unexpectedError() {
        return new EventError(500, "An unexpected error occurred", { code: "UNEXPECTED_ERROR" });
    }
}