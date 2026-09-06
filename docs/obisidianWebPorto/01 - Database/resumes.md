# Resumes Table

Model: `Resume`
Table Map: `resumes`
File: `prisma/schema.prisma`

## Columns

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | String | `@id @default(cuid())` | Unique identifier |
| `url` | String | | MinIO public URL |
| `filename` | String | | Original uploaded filename |
| `sizeBytes` | Int | `@map("size_bytes")` | File size in bytes |
| `createdAt` | DateTime | `@default(now()) @map("created_at")` | Record creation timestamp |
| `updatedAt` | DateTime | `@updatedAt @map("updated_at")` | Record last updated timestamp |

## Singleton Logic
The system treats this table as a singleton. Creating a new resume deletes the old row and its associated object in MinIO.

## Usage
- Download link for visitors.
- Managed in Admin settings.
- API: [[resume API]].
