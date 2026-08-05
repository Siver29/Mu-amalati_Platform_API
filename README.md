# Baladna API

Baladna is a **civic issue reporting platform**. Citizens submit public issue reports (damaged roads, water leaks, waste accumulation, broken streetlights), and government employees review and update their statuses. This is an **educational MVP** built with **Laravel 12** to practice consuming Laravel REST APIs from a separate React frontend.

## Features

- **Authentication** with Laravel Sanctum (register, login, logout, profile)
- **Three roles**: `citizen`, `employee`, `admin`
- **Public reference data**: areas (hierarchical), agencies, categories
- **Report workflow**: submit → under_review → accepted → in_progress → resolved (with reject/cancel)
- **Report images** upload (max 5 per report, JPG/PNG/WebP, 5 MB)
- **Report confirmations** and **reviews**
- **Employee dashboard** scoped to their agency
- **Admin CRUD** for areas, agencies, categories, users, and report assignment
- **Community**: posts and comments with ownership policies
- **Filtering & pagination** on reports
- **Consistent JSON responses** and **API Resources**
- **Feature tests** covering the full workflow
- **Postman collection** for API testing

## Requirements

- PHP 8.2+
- Composer
- MySQL (or SQLite for a quick local start)

## Installation

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Configure MySQL in `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=baladna
DB_USERNAME=root
DB_PASSWORD=
```

> **Note:** The local project currently uses SQLite (`DB_CONNECTION=sqlite` with `database/database.sqlite`) so it runs out of the box. Switch to MySQL using the values above for the production-style setup. Automated tests always use an in-memory SQLite database regardless of `.env`.

After configuring MySQL, run:

```bash
php artisan migrate --seed
```

## Test Credentials

The `--seed` command creates these accounts (local development only):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@baladna.test` | `password` |
| Employee | `employee@baladna.test` | `password` |
| Citizen | `citizen@baladna.test` | `password` |

## Running Tests

```bash
php artisan test
```

## Code Style

```bash
vendor/bin/pint
```

## Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer {sanctum-token}
```

Obtain a token from `POST /api/v1/auth/login`. Protected endpoints use the `auth:sanctum` guard. Inactive users are blocked from login and protected endpoints.

---

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

### Authentication

| Method | URI | Auth | Role | Description |
|--------|-----|------|------|-------------|
| POST | `/auth/register` | Public | – | Register a citizen account |
| POST | `/auth/login` | Public | – | Login, returns user + token |
| POST | `/auth/logout` | `auth:sanctum` | Any | Revoke current token |
| GET | `/me` | `auth:sanctum` | Any | Get authenticated user |
| PATCH | `/me` | `auth:sanctum` | Any | Update own profile |

### Reference Data (Public)

| Method | URI | Auth | Description |
|--------|-----|------|-------------|
| GET | `/areas` | Public | List areas (`?parent_id=1`) |
| GET | `/areas/{area}` | Public | Show an area |
| GET | `/agencies` | Public | List agencies |
| GET | `/agencies/{agency}` | Public | Show an agency |
| GET | `/categories` | Public | List categories (`?agency_id=1&active=1`) |
| GET | `/categories/{category}` | Public | Show a category |

### Citizen Reports

| Method | URI | Auth | Description |
|--------|-----|------|-------------|
| GET | `/reports` | `auth:sanctum` | List/filter/paginate reports |
| POST | `/reports` | `auth:sanctum` | Create a report (multipart/form-data) |
| GET | `/reports/{report}` | `auth:sanctum` | Show a report |
| PATCH | `/reports/{report}` | `auth:sanctum` | Update own submitted report |
| POST | `/reports/{report}/cancel` | `auth:sanctum` | Cancel own report |
| GET | `/my-reports` | `auth:sanctum` | List own reports |
| POST | `/reports/{report}/images` | `auth:sanctum` | Upload images |
| DELETE | `/reports/{report}/images/{image}` | `auth:sanctum` | Delete an image |
| POST | `/reports/{report}/confirm` | `auth:sanctum` | Confirm another citizen's report |
| DELETE | `/reports/{report}/confirm` | `auth:sanctum` | Remove confirmation |
| GET | `/reports/{report}/history` | `auth:sanctum` | Status history |
| POST | `/reports/{report}/review` | `auth:sanctum` | Review own resolved report |

### Report Filters

`GET /api/v1/reports` supports:

| Param | Example | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `per_page` | `10` | Items per page (max 50) |
| `status` | `submitted` | Filter by status |
| `category_id` | `1` | Filter by category |
| `area_id` | `2` | Filter by area |
| `agency_id` | `1` | Filter by agency |
| `search` | `pothole` | Search title/description/reference/address |
| `sort` | `newest` / `oldest` / `most_confirmed` | Sort order |

Filters can be combined.

### Employee Reports

| Method | URI | Auth | Role | Description |
|--------|-----|------|------|-------------|
| GET | `/employee/reports` | `auth:sanctum` | employee/admin | List agency reports |
| GET | `/employee/reports/{report}` | `auth:sanctum` | employee/admin | Show agency report |
| PATCH | `/employee/reports/{report}/status` | `auth:sanctum` | employee/admin | Update report status |
| POST | `/employee/reports/{report}/public-note` | `auth:sanctum` | employee/admin | Add public note |

**Allowed status transitions:**

- `submitted → under_review`
- `under_review → accepted`
- `under_review → rejected` (requires `rejection_reason`)
- `accepted → in_progress`
- `in_progress → resolved` (requires `resolution_note`)
- `submitted → cancelled`, `under_review → cancelled` (by citizen)

Invalid transitions return **409**.

### Admin CRUD

All admin endpoints require the `admin` role.

| Method | URI | Description |
|--------|-----|-------------|
| GET/POST | `/admin/areas` | List / create areas |
| GET/PATCH/DELETE | `/admin/areas/{area}` | Show / update / delete area |
| GET/POST | `/admin/agencies` | List / create agencies |
| GET/PATCH/DELETE | `/admin/agencies/{agency}` | Show / update / delete agency |
| GET/POST | `/admin/categories` | List / create categories |
| GET/PATCH/DELETE | `/admin/categories/{category}` | Show / update / delete category |
| GET/POST | `/admin/users` | List / create users |
| GET/PATCH/DELETE | `/admin/users/{user}` | Show / update / delete user |
| PATCH | `/admin/reports/{report}/assign` | Assign an employee to a report |

**Assignment request:**

```json
{
  "employee_id": 5
}
```

The employee must have the `employee` role and belong to the report's agency.

Deleting referenced users/agencies/areas/categories is blocked — deactivate them instead.

### Community

| Method | URI | Auth | Description |
|--------|-----|------|-------------|
| GET | `/posts` | `auth:sanctum` | List posts |
| POST | `/posts` | `auth:sanctum` | Create a post |
| GET | `/posts/{post}` | `auth:sanctum` | Show a post with comments |
| PATCH | `/posts/{post}` | `auth:sanctum` | Update own post |
| DELETE | `/posts/{post}` | `auth:sanctum` | Delete own post (admin any) |
| GET | `/posts/{post}/comments` | `auth:sanctum` | List comments |
| POST | `/posts/{post}/comments` | `auth:sanctum` | Add a comment |
| PATCH | `/comments/{comment}` | `auth:sanctum` | Update own comment |
| DELETE | `/comments/{comment}` | `auth:sanctum` | Delete own comment (admin any) |

---

## Example API Requests

### Register a citizen

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Mohammad Ahmad",
  "email": "mohammad@example.com",
  "phone": "+9647000000000",
  "password": "password123",
  "password_confirmation": "password123",
  "area_id": 1
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "citizen@baladna.test",
  "password": "password"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 3,
      "name": "Baladna Citizen",
      "email": "citizen@baladna.test",
      "role": "citizen"
    },
    "token": "1|sanctum-token"
  }
}
```

### Create a report (multipart/form-data)

```
POST /api/v1/reports
Authorization: Bearer {token}
Content-Type: multipart/form-data

category_id=1
area_id=2
title=Large pothole in the main street
description=The pothole is dangerous.
address=Main Street
images[]=@photo.jpg
```

The backend automatically sets `user_id`, `agency_id` (from category), `status=submitted`, `priority=normal`, and generates a `reference_number`.

### Update report status (employee)

```http
PATCH /api/v1/employee/reports/{report}/status
Authorization: Bearer {employee_token}
Content-Type: application/json

{
  "status": "in_progress",
  "note": "The maintenance team has started working on the issue."
}
```

### Reject a report

```http
PATCH /api/v1/employee/reports/{report}/status

{
  "status": "rejected",
  "rejection_reason": "The submitted location is not clear."
}
```

---

## Response Format

### Success (single resource)

```json
{
  "success": true,
  "message": "Report created successfully.",
  "data": {}
}
```

### Success (collection)

```json
{
  "success": true,
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 50,
    "last_page": 5
  }
}
```

### Validation error (422)

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "title": ["The title field is required."]
  }
}
```

### Authentication error (401)

```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

### Authorization error (403)

```json
{
  "success": false,
  "message": "You are not authorized to perform this action."
}
```

### Not found (404)

```json
{
  "success": false,
  "message": "Resource not found."
}
```

### HTTP status codes

| Code | Meaning |
|------|---------|
| 200 | Successful retrieval / update |
| 201 | Created resource |
| 204 | Successful deletion (no body) |
| 401 | Unauthenticated |
| 403 | Unauthorized |
| 404 | Not found |
| 409 | Invalid state conflict |
| 422 | Validation error |

---

## React Integration Guide

Create an Axios instance with the base URL and token interceptor:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
```

### 1. Login

```js
const response = await api.post("/auth/login", {
  email,
  password,
});

localStorage.setItem("token", response.data.data.token);
```

### 2. Fetch reports with filters

```js
const response = await api.get("/reports", {
  params: {
    page: 1,
    status: "submitted",
    area_id: 2,
  },
});
```

### 3. Create a report using FormData

```js
const formData = new FormData();

formData.append("category_id", categoryId);
formData.append("area_id", areaId);
formData.append("title", title);
formData.append("description", description);
formData.append("address", address);

images.forEach((image) => {
  formData.append("images[]", image);
});

const response = await api.post("/reports", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
```

### 4. Handle validation errors

```js
try {
  await api.post("/reports", data);
} catch (error) {
  if (error.response?.status === 422) {
    setErrors(error.response.data.errors);
  }
}
```

### 5. Logout

```js
await api.post("/auth/logout");
localStorage.removeItem("token");
```

### Key concepts for React

- **Bearer token auth**: send `Authorization: Bearer {token}` on every request.
- **CORS**: `config/cors.php` already allows `http://localhost:3000` and `http://localhost:5173`.
- **Pagination**: read `meta.current_page`, `meta.last_page`, `meta.total` from collection responses.
- **Validation errors**: `error.response.data.errors` is an object keyed by field name.
- **Image URLs**: the `Storage::disk('public')` files are served from `/storage/...` after running `php artisan storage:link`. Use `http://localhost:8000/storage/{image_path}`.
- **Protected React routes**: check the authenticated user's `role` (from `/me`) to guard routes.
- **Role-based UI**: render different views for `citizen`, `employee`, and `admin` based on `user.role`.

---

## Project Structure

```
app/
├── Enums/                 # Role, ReportStatus, Priority
├── Http/
│   ├── Controllers/Api/V1/  # Auth, reports, employee, admin, community
│   ├── Middleware/          # EnsureUserIsAdmin, EnsureUserIsEmployeeOrAdmin
│   ├── Requests/            # Form Request validation classes
│   ├── Resources/           # API Resources
│   └── Responses/           # ApiResponse trait
├── Models/                 # Eloquent models + relationships
├── Policies/               # Report, Post, Comment policies
├── Providers/
└── Services/               # ReportStatusService (status transitions)
database/
├── factories/
├── migrations/
└── seeders/
tests/
└── Feature/               # Feature tests
```

## Postman Collection

A ready-to-use Postman collection is included at the project root:

- `Baladna.postman_collection.json`

It includes environment variables:

- `base_url` = `http://localhost:8000/api/v1`
- `citizen_token`
- `employee_token`
- `admin_token`

The Login request auto-saves the token into the matching environment variable. Requests are organized into **Authentication**, **Reference Data**, **Citizen Reports**, **Employee Reports**, **Admin**, and **Community** folders.
#   M u - a m a l a t i _ P l a t f o r m _ A P I  
 