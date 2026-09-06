# Portfolios Table

Model: `Portfolio`
Table Map: `portfolios`
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
The system treats this table as a singleton. Creating a new portfolio deletes the old row and its associated object in MinIO.

## Usage
- Displayed/downloadable on the website.
- Managed in Admin panel.
- API: [[portfolio API]].
