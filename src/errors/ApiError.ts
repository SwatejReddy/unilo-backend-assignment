import { Context } from "hono";
import ApiResponse from "../utils/ApiResponse";

// errors/ApiError.ts
export class ApiError extends Error {
    statusCode: number;
    details: any;

    constructor(statusCode: number, message: string, details: any = {}) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    static validationFailed(message: string = "Invalid Inputs", details: any = {}) {
        return new ApiError(400, message, details);
    }

    static notFound(message: string = "Resource not found", details: any = {}) {
        return new ApiError(404, message, details);
    }

    static unauthorized(message: string = "You are not authorized to perform this action", details: any = {}) {
        return new ApiError(403, message, details);
    }

    static internalError(message: string = "Internal Server Error", details: any = {}) {
        return new ApiError(500, message, details);
    }

    static databaseConnectionError() {
        return new ApiError(500, "Couldn't connect to the database");
    }
}