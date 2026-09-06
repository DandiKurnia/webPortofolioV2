# Skills Table

Model: `Skill`
Table Map: `skills`
File: `prisma/schema.prisma`

## Columns

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | String | `@id @default(cuid())` | Unique identifier |
| `title` | String | | Name of the skill |
| `description` | String | | Brief details about proficiency |
| `icon` | String | `@default("code")` | Lucide icon symbol string |
| `createdAt` | DateTime | `@default(now()) @map("created_at")` | Record creation timestamp |
| `updatedAt` | DateTime | `@updatedAt @map("updated_at")` | Record last updated timestamp |

## Usage
- Displayed on the home page.
- Managed inside `/admin/skills` panel.
- CRUD API: [[skills API]].
