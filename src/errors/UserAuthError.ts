export class UserAuthError extends Error {
    statusCode: number;
    details: any;

    constructor(statusCode: number, message: string, details: any = {}) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, UserAuthError.prototype);
    }

    static invalidCredentials(message: string = "Invalid Credentials", details: any = {}) {
        return new UserAuthError(400, message, details);
    }

    static userNotFound(userType: "participant" | "admin", details: any = {}) {
        return new UserAuthError(404,
            `${userType} not found`,
            details);
    }

    static userExists(userType: "participant" | "admin", details: any = {}) {
        return new UserAuthError(400,
            `${userType} already exists`,
            details);
    }

    static cannotCreateUser(userType: "participant" | "admin", details: any = {}) {
        return new UserAuthError(500,
            `An error occurred while creating the ${userType}`,
            details);
    }
}