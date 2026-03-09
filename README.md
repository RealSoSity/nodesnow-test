# Task Management API

A RESTful API built with **NestJS** for managing tasks and users authentication.

---

## Project Setup instructions

### Prerequisites

- **Node.js**
- **npm**
- **Docker**

### Installation

```bash
# Clone git repository
git clone https://github.com/RealSoSity/nodesnow-test.git
cd nodesnow-test

# Install dependencies
npm install
```

### Environment Variables (env)

Create a `.env` file or rename `.env.example` to `.env` in the root directory:

```env
# Database (PostgreSQL)
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=

# Authentication
JWT_SECRET=
SALT_ROUNDS=
```

### Running the App

```bash
docker compose up -d
```

Now you can use Postman check at `http://localhost:3000`.

---

## Architectural Decisions

### Project Structure

```
src/
├── auth/                         # Authentication module
|   ├── dto/                      # Data validation & transform
|   |   ├── register.dto.ts
|   |   └── login.dto.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── auth.guard.ts             # JWT Custom AuthGuard authentication
├── tasks/                        # Tasks Module
|   ├── dto/                      # Tasks Data transfer Object
|   |   ├── create-tasks.dto.ts
|   |   └── update-tasks.dto.ts
|   ├── enums/
|   |   └── task-status.enum.ts
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── tasks.module.ts
│   └── entities/                 # Tasks Sequelize entities
├── user/                         # Users Module
|   ├── dto/                      # User Data Transfer Object
|   |   ├── create-user.dto.ts
|   |   └── update-user.dto.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.module.ts
│   └── entities/                 # User Sequelize entities
├── app.module.ts                 # Root module
└── main.ts
```

### Key Decisions

- **Sequelize** - Use for managing PostgreSQL Database.<br>
- **JWT-based Authentication** - Using a Lightweight, simple basic Custom AuthGuard for demonstrate Basic JWT-based authentication. <br>
- **Class-validator & Class-Transformer** - Automatically validate and convert incoming requests into objects, making data easier and safer to handle. <br>
- **Swagger** - utomatically generates interactive API documentation, test endpoints and share clear data structures.<br>

---

## API Endpoints

### Base URL

```
http://localhost:3000/
```

---

### Auth

#### Register a new user

```bash
curl -X 'POST' \
  'http://localhost:3000/auth/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user@example.com",
  "password": "UserExample"
}'
```

**Response** `201 Created`

```json
{
  "id": "uuid",
  "email": "user@example.com"
}
```

#### Login

```bash
curl -X 'POST' \
  'http://localhost:3000/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user@example.com",
  "password": "UserPassword"
}'
```

**Response** `200 OK`

```json
{
  "access_token": "eyJhb..."
}
```

---

### User

> All user endpoints require authentication.
> header: `Authorization: Bearer <token>`

#### Get current user data

```bash
curl -X 'GET' \
  'http://localhost:3000/user' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJh...'
```

**Response** `200 OK`

```json
{
  "id": "user-uuid",
  "email": "user@example.com"
}
```

---

### Tasks

> All tasks endpoints require user authentication.
> header: `Authorization: Bearer <token>`

#### Create new task

```bash
curl -X 'POST' \
  'http://localhost:3000/tasks' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhb....' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "TaskTitle",
  "description": "TaskDescription",
  "status": "pending"
}'
```

**Response** `201 Created`

```json
{
  "id": "task-uuid",
  "title": "TaskTitle",
  "description": "TaskDescription",
  "status": "pending",
  "userId": "user-uuid",
  "updatedAt": "Updated-Time",
  "createdAt": "Created-Time"
}
```

#### Get all tasks

```bash
curl -X 'GET' \
  'http://localhost:3000/tasks' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhb...'
```

**Response** `200 OK`

```json
[
  {
    "id": "task-uuid",
    "title": "TaskTitle",
    "description": "TaskDescription",
    "status": "pending",
    "userId": "user-uuid",
    "updatedAt": "Updated-Time",
    "createdAt": "Created-Time"
  },
  {
    "id": "task-uuid",
    "title": "TaskTitle",
    "description": "TaskDescription",
    "status": "pending",
    "userId": "user-uuid",
    "updatedAt": "Updated-Time",
    "createdAt": "Created-Time"
  }
]
```

#### Get specific task by ID

```bash
curl -X 'GET' \
  'http://localhost:3000/tasks/:id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhb...'
```

**Response** `200 OK`

```json
{
  "id": "task-uuid",
  "title": "TaskTitle",
  "description": "TaskDescription",
  "status": "pending",
  "userId": "user-uuid",
  "updatedAt": "Updated-Time",
  "createdAt": "Created-Time"
}
```

#### Update/Patch specific task by ID

```bash
curl -X 'PATCH' \
  'http://localhost:3000/tasks/b9df96ff-761e-4baa-b812-9e5350c07b1c' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhb...' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "UpdateTaskTitle",
  "description": "UpdateTaskDescription",
  "status": "in_progress"
}'
```

**Response** `200 OK`

```json
{
  "id": "task-uuid",
  "title": "TaskTitle",
  "description": "TaskDescription",
  "status": "pending",
  "userId": "user-uuid",
  "updatedAt": "Updated-Time",
  "createdAt": "Created-Time"
}
```

#### Delete specific task by ID

```bash
curl -X 'DELETE' \
  'http://localhost:3000/tasks/b9df96ff-761e-4baa-b812-9e5350c07b1c' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhb...'
```

**Response** `204 No Content`


---
