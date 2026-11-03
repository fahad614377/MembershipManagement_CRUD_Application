<div align="center">

# Membership Management System

**A full-stack library membership application built with ASP.NET Core Web API and Angular**

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?logo=csharp&logoColor=white)
![EF Core](https://img.shields.io/badge/EF%20Core-9.0-512BD4)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?logo=microsoftsqlserver&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)

</div>

---

## Overview

Membership Management System is a CRUD application for managing library members, their membership categories, profile photos, and the books each member has borrowed. It follows a clean client-server architecture: a RESTful **ASP.NET Core Web API** with **Entity Framework Core (Code First)** on the backend, and a standalone-component **Angular** single-page application on the frontend.

The project demonstrates a complete, working vertical slice: database design and migrations, a REST API with file upload, and a responsive UI with a master-detail form.

## Key Features

- **Full member CRUD**: create, list, edit, and delete members
- **Master-detail form**: a member and any number of borrowed books are saved together in a single request
- **Dynamic rows**: an "Add Item" button adds a new book/author row on every click, and rows can be removed individually
- **Category dropdown**: displays the category name while sending the `categoryId` to the API
- **Profile image upload** with instant preview, file type validation (JPG/PNG) and a 2 MB size limit
- **Smart update logic**: when a member is edited, the API adds new borrowed items, updates existing ones, and removes the ones deleted in the UI
- **Cascade delete**: deleting a member also removes the member's borrowed items
- **Seed data**: categories and a sample member are created by the first migration
- **Swagger UI** for exploring and testing the API in development

## Architecture

```
 ┌─────────────────────┐
 │ Angular SPA         │
 │ localhost:4200      │
 └──────────┬──────────┘
            │  HTTP / JSON, multipart/form-data
            ▼
 ┌─────────────────────┐          ┌───────────────────────┐
 │ ASP.NET Core Web API│─EF Core─►│ SQL Server            │
 │ localhost:5053      │          │ CoreApiLibrary70      │
 └──────────┬──────────┘          └───────────────────────┘
            │  saves / serves files
            ▼
 ┌─────────────────────┐
 │ wwwroot/images      │
 └─────────────────────┘
```

### Create / edit flow

1. The user fills in the member form, adds borrowed books, and optionally picks an image.
2. Angular sends `POST /api/Members` (create) or `PUT /api/Members/{id}` (edit).
3. The API saves the member and its borrowed items in SQL Server and returns the member (create) or `204 No Content` (edit).
4. If an image was selected, Angular calls `POST /api/Members/Upload/{id}`.
5. The API validates the file type and size, saves it with a GUID file name, and stores the file name in `ImageUrl`.
6. Angular redirects the user to the member list.

## Tech Stack

| Layer        | Technologies                                                                 |
|--------------|-------------------------------------------------------------------------------|
| **Backend**  | C#, ASP.NET Core Web API (.NET 9), Entity Framework Core 9, Swagger/Swashbuckle |
| **Database** | Microsoft SQL Server (LocalDB by default), EF Core Migrations                |
| **Frontend** | Angular 22 (standalone components, Router, HttpClient, Forms), TypeScript, RxJS |
| **UI**       | Bootstrap 5, Angular control flow (`@if`, `@for`)                            |

## Database Design

| Table           | Columns                                                                                                      |
|-----------------|--------------------------------------------------------------------------------------------------------------|
| `Categories`    | `CategoryId` (PK), `CategoryName`                                                                            |
| `Members`       | `MemberId` (PK), `MemberName`, `MembershipDate`, `MembershipFee`, `IsStudent`, `CategoryId` (FK), `ImageUrl` |
| `BorrowedItems` | `BorrowedItemId` (PK), `BookName`, `AuthorName`, `MemberId` (FK)                                             |

**Relationships:** one `Category` has many `Members`, and one `Member` has many `BorrowedItems`.

- `MembershipFee` is stored with the SQL `money` type
- `BorrowedItems.MemberId` is configured with **cascade delete** through the Fluent API
- Seed data: three categories (Premium, Regular, Guest), one sample member, and two sample borrowed books

## Project Structure

```
MembershipManagement_CRUD_Application/
├── MemberCoreApi/                       # Backend solution
│   ├── MemberCoreApi.sln
│   └── MemberCoreApi/
│       ├── Controllers/
│       │   └── MembersController.cs     # REST endpoints + image upload
│       ├── Models/
│       │   └── Category.cs              # Category, Member, BorrowedItem, AppDbContext
│       ├── Migrations/                  # EF Core migrations
│       ├── wwwroot/images/              # Uploaded member photos
│       ├── appsettings.json             # Connection string
│       └── Program.cs                   # DI, CORS, JSON options, Swagger, middleware
│
└── member-Angular/                      # Frontend solution
    └── src/app/
        ├── components/
        │   ├── add-member/              # Create and edit form (master-detail)
        │   └── display-members/         # Member list with borrowed items
        ├── models/                      # Typed interfaces matching the API
        ├── services/
        │   └── member-service.ts        # Centralised HttpClient calls
        ├── app.routes.ts                # Client-side routing
        └── app.config.ts
```

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (latest LTS) and npm
- [Angular CLI](https://angular.dev/tools/cli): `npm install -g @angular/cli`
- SQL Server LocalDB, SQL Server Express, or any SQL Server instance
- EF Core CLI: `dotnet tool install --global dotnet-ef`

### 1. Clone the repository

```bash
git clone https://github.com/fahad614377/MembershipManagement_CRUD_Application.git
cd MembershipManagement_CRUD_Application
```

### 2. Run the API

```bash
cd MemberCoreApi/MemberCoreApi
dotnet ef database update
dotnet run
```

- API: `http://localhost:5053`
- Swagger UI: `http://localhost:5053/swagger` (Development environment)

The connection string is named `con` in `appsettings.json`:

```json
"ConnectionStrings": {
  "con": "server=(localdb)\\MSSQLLocalDB; database=CoreApiLibrary70; trusted_connection=true; multipleactiveresultsets=true"
}
```

Change the server name if you are not using LocalDB. You can also open `MemberCoreApi.sln` in Visual Studio, run `Update-Database` in the Package Manager Console, and press **F5**.

### 3. Run the Angular app

In a new terminal:

```bash
cd member-Angular
npm install
ng serve
```

Open `http://localhost:4200`.

> The API base URL (`http://localhost:5053`) is defined in `member-service.ts`, `add-member.ts`, and `display-members.ts`. If your API runs on another port, update it in these three files.

## API Reference

Base route: `/api/Members`

| Method   | Endpoint                   | Description                                             | Success response |
|----------|----------------------------|---------------------------------------------------------|------------------|
| `GET`    | `/api/Members`             | List all members with category and borrowed items       | `200 OK`         |
| `GET`    | `/api/Members/{id}`        | Get one member by ID                                    | `200 OK`         |
| `GET`    | `/api/Members/Categories`  | List all categories                                     | `200 OK`         |
| `POST`   | `/api/Members`             | Create a member with borrowed items                     | `201 Created`    |
| `PUT`    | `/api/Members/{id}`        | Update a member and synchronise borrowed items          | `204 No Content` |
| `DELETE` | `/api/Members/{id}`        | Delete a member and its borrowed items                  | `204 No Content` |
| `POST`   | `/api/Members/Upload/{id}` | Upload a profile image (`multipart/form-data`, field `File`) | `200 OK`    |

Error responses: `400 Bad Request` (id mismatch, missing file, wrong file type, file over 2 MB), `404 Not Found` (unknown member), `500` (database or file system error during update/upload).

**Example: create a member**

```http
POST /api/Members
Content-Type: application/json

{
  "memberName": "Fahad",
  "membershipDate": "2026-01-01",
  "membershipFee": 1500,
  "isStudent": true,
  "categoryId": 1,
  "borrowedItems": [
    { "bookName": "Ognibina", "authorName": "Kazi Nazrul Islam" }
  ]
}
```

## Frontend Routes

| Route                | Component         | Purpose                         |
|----------------------|-------------------|---------------------------------|
| `/display-member`    | `DisplayMembers`  | Member list (default route)     |
| `/add-member`        | `AddMember`       | Create a new member             |
| `/edit-member/:id`   | `AddMember`       | Edit an existing member         |

## Technical Highlights

- **Child collection synchronisation on update**: the `PUT` endpoint loads the existing member with its `BorrowedItems`, compares it to the incoming list, then removes missing items, updates matching ones, and inserts new ones, all in one `SaveChangesAsync` call
- **Safe file uploads**: content type whitelist (`image/jpeg`, `image/png`), a 2 MB size cap, GUID-based file names to avoid collisions and overwrites, and automatic creation of the images folder
- **Two-step save in the UI**: the member is saved first so the API can return its ID, then the image is uploaded against that ID; the user is redirected even if the image upload fails
- **Reusable component for create and edit**: `AddMember` switches mode based on the route parameter, and the same form handles both cases
- **Typed API contract**: TypeScript interfaces (`Member`, `Category`, `BorrowedItem`, `UploadResponse`) mirror the C# models
- **Serialization safety**: JSON `ReferenceHandler.IgnoreCycles` prevents circular reference errors between `Member` and `BorrowedItem`
- **Modern Angular syntax**: standalone components, built-in control flow (`@if`, `@for`), `inject()`-based service, and the new `@Service()` decorator

## Roadmap

Planned improvements to make the project production-ready:

- [ ] Request DTOs and server-side validation (Data Annotations / FluentValidation)
- [ ] JWT authentication and role-based authorization
- [ ] Pagination, search, and filtering on the member list
- [ ] Reactive Forms with client-side validation messages
- [ ] Global exception handling middleware and user-facing error messages
- [ ] Environment-based API URL configuration in Angular
- [ ] Restrict CORS to the frontend origin
- [ ] Unit and integration tests
- [ ] Docker support

## Author

**Fahad**

[![GitHub](https://img.shields.io/badge/GitHub-fahad614377-181717?logo=github)](https://github.com/fahad614377)

## License

This project is open source and available for learning and personal use.
