# Certifications Table

Model: `Certification`
Table Map: `certifications`
File: `prisma/schema.prisma`

## Columns

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | String | `@id @default(cuid())` | Unique identifier |
| `title` | String | | Certification title |
| `company` | String | | Issuing company/institution |
| `link` | String? | | Optional link to verification |
| `years` | String | | Year/duration of certificate validity |
| `createdAt` | DateTime | `@default(now()) @map("created_at")` | Record creation timestamp |
| `updatedAt` | DateTime | `@updatedAt @map("updated_at")` | Record last updated timestamp |

## Usage
- Displayed on the home page.
- Managed inside `/admin/certificates` panel.
- CRUD API: [[certifications API]].
