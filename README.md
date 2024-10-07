# High level interaction diagram

<img width="4186" alt="image_2024-10-03_21-59-18" src="https://github.com/user-attachments/assets/4af8bb6d-c030-4fed-8608-f6d59e43c372">

### Diagram Link: 
https://excalidraw.com/#json=guX0UwGn2mw9ONnoPRCka,3UUFOP5Jc4fAxe11WufYvA

# Key Points
Key Points of API design:

- Implemented RBAC (Role based access control for Admin and Participant routes) with authentication middlewares.
- Implemented JWT based authentication and authorization from scratch.
- Implemented password hashing along with salting for increased security.
- Implemented soft deletes instead of removing records directly from the database for future auditing and analytics purposes.
- Created a centralised error handling system with custom error classes and a handler.
- Implemented ApiResponse class to make the response structure consistent across all routes.
- Used Zod schemas for data validation.
- Used Typescript entirely to ensure type safety.
- Used HonoJS with NodeJS to make it compatible to deploy on Cloudflare workers.
- Hosted PostgreSQL database on Neon.tech in a serverless fashion.
- Used Prisma ORM for schema, querying and Prisma Accelerate for connection pooling as we are dealing with a serverless architecture here.
- Used HTTP only cookies to store JWT token over local storage for extra security.

# API Documentation
## (Database & backend are hosted & are live - Do test the APIs in postman)

Base URL: `https://unolo-event-manager.swatejreddy17.workers.dev/api/v1`

# Event Management API Documentation

## Postman API collection link:
https://www.postman.com/security-cosmonaut-86700114/assignment-workspace/collection/kfbz5vs/unolo-assignment

## Table of Contents
1. [Authentication](#authentication)
   - [Admin Signup](#admin-signup)
   - [Admin Login](#admin-login)
   - [Participant Signup](#participant-signup)
   - [Participant Login](#participant-login)
   - [Logout](#logout)
2. [Event Management](#event-management)
   - [Create Event](#create-event)
   - [Update Event](#update-event)
3. [Event Participation](#event-participation)
   - [Join Event](#join-event)
   - [Cancel Event Registration](#cancel-event-registration)
4. [Event Information](#event-information)
   - [Get Confirmed and Waitlist](#get-confirmed-and-waitlist)

## Authentication

### Admin Signup
Creates a new admin account.

- **URL:** `/auth/admin/signup`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "status": 200,
      "data": {},
      "message": "Admin Signup Successful",
      "success": true
    }
    ```
- **Error Response:**
  - **Code:** 400
  - **Content:** 
    ```json
    {
      "status": 400,
      "data": { "details": "Error details" },
      "message": "Invalid Inputs",
      "success": false
    }
    ```

  - **Code:** 400
  - **Content:** 
    ```json
    {
      "status": 400,
      "data": { "details": "Error details" },
      "message": "Admin already exists",
      "success": false
    }
    ```


### Admin Login
Authenticates an admin and returns a JWT token.

- **URL:** `/auth/admin/login`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "status": 200,
      "data": {
        "token": "JWT_TOKEN",
        "admin": {
          "id": "number",
          "name": "string",
          "username": "string",
          "email": "string"
        }
      },
      "message": "Admin Login Successful",
      "success": true
    }
    ```
- **Error Response:**
  - **Code:** 400
  - **Content:** 
    ```json
    {
      "status": 400,
      "data": { "details": "Error details" },
      "message": "Invalid Credentials",
      "success": false
    }
    ```

  - **Code:** 404
  - **Content:** 
    ```json
    {
      "status": 404,
      "data": { "details": "Error details" },
      "message": "Admin not found.",
      "success": false
    }
    ```


### Participant Signup
Creates a new participant account.

- **URL:** `/auth/participant/signup`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "status": 200,
      "data": {
        "participant": {
          "id": "number",
          "name": "string",
          "email": "string",
          "username": "string"
        }
      },
      "message": "Participant Signup Successful",
      "success": true
    }
    ```
- **Error Response:**
  - **Code:** 400
  - **Content:** 
    ```json
    {
      "status": 400,
      "data": { "details": "Error details" },
      "message": "Invalid Inputs",
      "success": false
    }
    ```

  - **Code:** 400
  - **Content:** 
    ```json
    {
      "status": 400,
      "data": { "details": "Error details" },
      "message": "Participant already exists.",
      "success": false
    }
    ```

### Participant Login
Authenticates a participant and returns a JWT token.

- **URL:** `/auth/participant/login`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "status": 200,
      "data": {
        "token": "JWT_TOKEN",
        "participant": {
          "id": "number",
          "name": "string",
          "username": "string",
          "email": "string"
        }
      },
      "message": "Login Successful",
      "success": true
    }
    ```
- **Error Response:**
  - **Code:** 400
  - **Content:** 
    ```json
    {
      "status": 400,
      "data": { "details": "Error details" },
      "message": "Invalid Credentials",
      "success": false
    }
    ```

  - **Code:** 404
  - **Content:** 
    ```json
    {
      "status": 404,
      "data": { "details": "Error details" },
      "message": "Participant not found",
      "success": false
    }
    ```

### Logout
Logs out the current user (admin or participant).

- **URL:** `/auth/logout`
- **Method:** `POST`
- **Headers:** 
  - `Authorization: Bearer JWT_TOKEN`
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "status": 200,
      "data": {},
      "message": "Logout Successful",
      "success": true
    }
    ```

- **Error Response:**
  - **Code:** 401
  - **Content:** 
    ```json
    {
      "status": 401,
      "data": {
        "message": "Unauthorized"
      },
      "message": "Please login first",
      "success": true
    }
    ```


## Event Management

### Create Event
Creates a new event (admin only).

- **URL:** `/admin/event/create`
- **Method:** `POST`
- **Headers:** 
  - `Authorization: Bearer JWT_TOKEN`
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "date": "ISO8601 date string",
    "location": "string",
    "maxParticipants": "number"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "status": 200,
      "data": {
        "event": {
          "id": "number",
          "title": "string",
          "description": "string",
          "date": "ISO8601 date string",
          "location": "string",
          "maxParticipants": "number",
          "adminId": "number"
        }
      },
      "message": "Event created successfully",
      "success": true
    }
    ```
- **Error Response:**
  - **Code:** 400 or 500
  - **Content:** 
    ```json
    {
      "status": 400,
      "data": { "details": "Error details" },
      "message": "Invalid Inputs",
      "success": false
    }
    ```

### Update Event
Updates an existing event (admin only).

- **URL:** `/admin/event/update/:id`
- **Method:** `PUT`
- **Headers:** 
  - `Authorization: Bearer JWT_TOKEN`
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "date": "ISO8601 date string",
    "location": "string",
    "maxParticipants": "number"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "status": 200,
      "data": {
        "event": {
          "id": "number",
          "title": "string",
          "description": "string",
          "date": "ISO8601 date string",
          "location": "string",
          "maxParticipants": "number",
          "adminId": "number"
        }
      },
      "message": "Event updated successfully",
      "success": true
    }
    ```
- **Error Response:**
  - **Code:** 400, 403, or 404
  - **Content:** 
    ```json
    {
      "status": 404,
      "data": {},
      "message": "Event not found",
      "success": false
    }
    ```

## Event Participation

### Join Event
Registers a participant for an event.

- **URL:** `/participant/event/register/:id`
- **Method:** `POST`
- **Headers:** 
  - `Authorization: Bearer JWT_TOKEN`
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "status": 200,
      "data": {},
      "message": "Added to the confirmed list.",
      "success": true
    }
    ```
  OR
    ```json
    {
      "status": 200,
      "data": {},
      "message": "Confirmed list is full. Added to the waitlist.",
      "success": true
    }
    ```
- **Error Response:**
  - **Code:** 400 or 404
  - **Content:** 
    ```json
    {
      "status": 400,
      "data": {},
      "message": "You are already registered and in the confirmed list",
      "success": false
    }
    ```

### Cancel Event Registration
Cancels a participant's registration for an event.

- **URL:** `/participant/event/cancel-registration/:id`
- **Method:** `POST`
- **Headers:** 
  - `Authorization: Bearer JWT_TOKEN`
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "status": 200,
      "data": {},
      "message": "Your registration from the confirmed list has been cancelled successfully.",
      "success": true
    }
    ```
  OR
    ```json
    {
      "status": 200,
      "data": {},
      "message": "Your registration from the waitlist has been cancelled successfully",
      "success": true
    }
    ```
- **Error Response:**
  - **Code:** 400 or 404
  - **Content:** 
    ```json
    {
      "status": 400,
      "data": {},
      "message": "You are not registered for this event",
      "success": false
    }
    ```

## Event Information

### Get Confirmed and Waitlist
Retrieves the confirmed and waitlist for an event.

- **URL:** `/event/getConfirmedAndWaitList/:id`
- **Method:** `GET`
- **Headers:** 
  - `Authorization: Bearer JWT_TOKEN`
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "status": 200,
      "data": {
        "confirmedList": [
          { "participantId": "number" }
        ],
        "waitList": [
          { "participantId": "number" }
        ]
      },
      "message": "Confirmed and Waitlist fetched successfully",
      "success": true
    }
    ```
- **Error Response:**
  - **Code:** 404 or 500
  - **Content:** 
    ```json
    {
      "status": 404,
      "data": {},
      "message": "No participants found",
      "success": false
    }
    ```

## Error Handling

All endpoints use a consistent error handling mechanism. Errors are returned with appropriate HTTP status codes and a JSON response body containing details about the error.

Example error response:

```json
{
  "status": 400,
  "data": { 
    "details": "Specific error details"
  },
  "message": "Error message",
  "success": false
}
```

Common error types include:
- `ApiError`: General API errors (e.g., validation failures, unauthorized access)
- `UserAuthError`: Authentication-related errors
- `EventError`: Event-specific errors
