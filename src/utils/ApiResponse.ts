export interface IApiResponse {
    status: number;
    data: any,
    message: string;
    success: boolean;
}

class ApiResponse implements IApiResponse {
    status: number;
    data: any;
    message: string;
    success: boolean;

    constructor(statusCode: number, data: any, message: string) {
        this.status = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export default ApiResponse;