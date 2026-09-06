# Users Table

Model: `User`
Table Map: `users`
File: `prisma/schema.prisma`

## Columns

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | String | `@id @default(cuid())` | Unique user identifier |
| `email` | String | `@unique` | Email address (login username) |
| `password` | String | | Bcrypt hashed password |
| `name` | String? | | Optional profile name |
| `createdAt` | DateTime | `@default(now()) @map("created_at")` | Record creation timestamp |
| `updatedAt` | DateTime | `@updatedAt @map("updated_at")` | Record last updated timestamp |

## Usage
- Admin authentication via [[auth-flow]].
