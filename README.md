# High level interaction diagram

<img width="4186" alt="image_2024-10-03_21-59-18" src="https://github.com/user-attachments/assets/4af8bb6d-c030-4fed-8608-f6d59e43c372">

### Diagram Link: 
https://excalidraw.com/#json=guX0UwGn2mw9ONnoPRCka,3UUFOP5Jc4fAxe11WufYvA

# Authentication API Documentation
## (Database & backend are hosted & are live - Do test the APIs in postman)

Base URL: `https://unilo-event-manager.swatejreddy17.workers.dev/api/v1`

## Admin Endpoints

### Admin Signup
Creates a new admin account.

- **API:** `https://unilo-event-manager.swatejreddy17.workers.dev/api/v1/auth/admin/signup`
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
      "statusCode": 200,
      "data": {},
      "message": "Admin Signup Successful"
    }
    ```
- **Error Responses:**
  - **Code:** 400
    - **Content:** `{"statusCode": 400, "data": {}, "message": "Admin already exists"}`
  - **Code:** 400
    - **Content:** `{"statusCode": 400, "data": {"errors": [...]}, "message": "Invalid Inputs"}`
  - **Code:** 500
    - **Content:** `{"statusCode": 500, "data": {}, "message": "An error occurred while creating the admin"}`

### Admin Login
Authenticates an admin.

- **API:** `https://unilo-event-manager.swatejreddy17.workers.dev/api/v1/auth/admin/login`
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
      "statusCode": 200,
      "data": {
        "token": "string",
        "admin": {
          "id": "string",
          "name": "string",
          "email": "string",
          "username": "string"
        }
      },
      "message": "Admin Login Successful"
    }
    ```
  - **Sets Cookie:** `jwt` (httpOnly, secure, sameSite: strict)
- **Error Responses:**
  - **Code:** 404
    - **Content:** `{"statusCode": 404, "data": {}, "message": "Admin not found"}`
  - **Code:** 401
    - **Content:** `{"statusCode": 401, "data": {}, "message": "Invalid Credentials"}`

## Participant Endpoints

### Participant Signup
Creates a new participant account.

- **API:** `https://unilo-event-manager.swatejreddy17.workers.dev/api/v1/auth/participant/signup`
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
      "statusCode": 200,
      "data": {
        "participant": {
          "id": "string",
          "name": "string",
          "email": "string",
          "username": "string"
        }
      },
      "message": "Participant Signup Successful"
    }
    ```
- **Error Responses:**
  - **Code:** 400
    - **Content:** `{"statusCode": 400, "data": {}, "message": "Participant already exists"}`
  - **Code:** 400
    - **Content:** `{"statusCode": 400, "data": {"errors": [...]}, "message": "Invalid Inputs"}`

### Participant Login
Authenticates a participant.

- **API:** `https://unilo-event-manager.swatejreddy17.workers.dev/api/v1/auth/participant/login`
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
      "statusCode": 200,
      "data": {
        "token": "string",
        "participant": {
          "id": "string",
          "name": "string",
          "email": "string",
          "username": "string"
        }
      },
      "message": "Login Successful"
    }
    ```
  - **Sets Cookie:** `jwt` (httpOnly, secure, sameSite: strict)
- **Error Responses:**
  - **Code:** 404
    - **Content:** `{"statusCode": 404, "data": {}, "message": "Participant not found"}`
  - **Code:** 401
    - **Content:** `{"statusCode": 401, "data": {}, "message": "Invalid Credentials"}`

## Common Endpoints

### Logout
Logs out the current user (admin or participant).

- **API:** `https://unilo-event-manager.swatejreddy17.workers.dev/api/v1/auth/logout`
- **Method:** `POST`
- **Authentication Required:** Yes (JWT token in cookie)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "statusCode": 200,
      "data": {},
      "message": "Participant logout Successful"
    }
    ```
  - **Clears Cookie:** `jwt`
- **Error Response:**
  - **Code:** 401
    - **Content:** `{"statusCode": 401, "data": {}, "message": "Please login first"}`

## Authentication Notes

- All successful login responses set a secure HTTP-only cookie containing a JWT token
- The logout endpoint requires a valid JWT token in the cookie
- Tokens include the user's role (admin or participant) for role-based access control
- Password hashing is implemented using a salt for additional security
