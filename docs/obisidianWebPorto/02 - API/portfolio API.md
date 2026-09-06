# Portfolio API

File: `app/api/portfolio/route.ts`

## `GET /api/portfolio`
- **Access**: Public
- **Returns**: The single active `Portfolio` document, or null.

## `POST /api/portfolio`
- **Access**: Protected
- **Body**: `{ url, filename, size }`
- **Behavior**: Creates a new row. Iterates and deletes all older rows from DB. Utilizes `@aws-sdk/client-s3` via [[minio-s3]] to delete old MinIO objects.
- **Returns**: Created `Portfolio`.

## `DELETE /api/portfolio`
- **Access**: Protected
- **Behavior**: Deletes all `Portfolio` rows and deletes their MinIO objects.
- **Returns**: `{ message }`
