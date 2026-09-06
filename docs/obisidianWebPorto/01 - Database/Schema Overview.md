# Schema Overview

Database configured via Prisma `prisma/schema.prisma` targeting **PostgreSQL**.

## Tables

- [[users]] - Admin authentication details.
- [[skills]] - Portfolio developer skills.
- [[projects]] - Showcased portfolio projects.
- [[certifications]] - Professional certifications.
- [[resumes]] - Active resume documents (singleton logic).
- [[portfolios]] - Active portfolio documents (singleton logic).

## Relationships

All models are independent. No relational foreign keys defined.
All models use String primary keys mapping to `cuid()`.
All models maintain `createdAt` (`created_at`) and `updatedAt` (`updated_at`) timestamps.
