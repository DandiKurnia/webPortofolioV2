# MinIO S3 Service

File: `lib/minio.ts`
Dependency: `@aws-sdk/client-s3`

- `S3Client` configured with endpoint `MINIO_ENDPOINT` pointing to `http://localhost:9000` as default.
- Bucket: `MINIO_BUCKET` (default `projects`).
- `publicUrl(key)`: Constructs the publicly accessible URL (prefixed with `MINIO_PUBLIC_URL`).
- `keyFromUrl(url)`: Parses the S3 object key back out from a public URL for deletion.
- Utilized directly by [[resume API]], [[portfolio API]], [[upload API]].
