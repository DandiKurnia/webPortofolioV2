# Upload API

File: `app/api/upload/route.ts`

## `POST /api/upload`
- **Access**: Protected
- **Body**: `FormData` containing `file` and `kind` (`image`, `resume`, `portfolio`).
- **Behavior**: 
  - Validates types (Images vs PDFs) based on `kind`.
  - Enforces size limits (5MB images, 10MB PDFs).
  - Uploads to S3/MinIO via [[minio-s3]].
- **Returns**: `{ url, key, filename, size }`
