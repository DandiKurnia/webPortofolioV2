# Resume API

File: `app/api/resume/route.ts`

## `GET /api/resume`
- **Access**: Public
- **Returns**: The single active `Resume` document, or null.

## `POST /api/resume`
- **Access**: Protected
- **Body**: `{ url, filename, size }`
- **Behavior**: Creates a new row. Iterates and deletes all older rows from DB. Utilizes `@aws-sdk/client-s3` via [[minio-s3]] to delete old MinIO objects.
- **Returns**: Created `Resume`.

## `DELETE /api/resume`
- **Access**: Protected
- **Behavior**: Deletes all `Resume` rows and deletes their MinIO objects.
- **Returns**: `{ message }`
