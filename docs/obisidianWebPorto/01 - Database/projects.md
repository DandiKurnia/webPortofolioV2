# Projects Table

Model: `Project`
Table Map: `projects`
File: `prisma/schema.prisma`

## Columns

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | String | `@id @default(cuid())` | Unique identifier |
| `title` | String | | Project title |
| `description` | String | | Description of build and features |
| `link` | String? | | Optional link to live site or repo |
| `image` | String? | | Optional URL to image stored on MinIO |
| `technologies` | String[] | | Technologies utilized |
| `createdAt` | DateTime | `@default(now()) @map("created_at")` | Record creation timestamp |
| `updatedAt` | DateTime | `@updatedAt @map("updated_at")` | Record last updated timestamp |

## Usage
- Displayed in `/projects` page and home page.
- Managed inside `/admin/project` panel.
- CRUD API: [[projects API]].
