# Docker Deployment Guide

This project is configured for Docker deployment with GitHub Actions CI/CD.

## Quick Start (Local Testing)

1. **Build and run with docker-compose:**

   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - App: http://localhost:3000
   - MinIO Console: http://localhost:9001
   - PostgreSQL: localhost:5433

## Production Deployment

### GitHub Actions (Automated)

The workflow `.github/workflows/docker-publish.yml` automatically:

- Builds the Docker image on push to `main` branch
- Pushes to GitHub Container Registry (ghcr.io)
- Tags images with branch name, SHA, and `latest`

**Image location:** `ghcr.io/<your-username>/webportofoliov2:latest`

### Pull and Run on Your Server

1. **Login to GitHub Container Registry:**

   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u <your-username> --password-stdin
   ```

2. **Pull the image:**

   ```bash
   docker pull ghcr.io/<your-username>/webportofoliov2:latest
   ```

3. **Create a production docker-compose.yml:**

   ```yaml
   services:
     postgres:
       image: postgres:16-alpine
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: ${DB_PASSWORD}
         POSTGRES_DB: webportofoliov2
       volumes:
         - postgres_data:/var/lib/postgresql/data

     app:
       image: ghcr.io/<your-username>/webportofoliov2:latest
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/webportofoliov2
         NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
         NEXTAUTH_URL: ${NEXTAUTH_URL}
         MINIO_ENDPOINT: ${MINIO_ENDPOINT}
         MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
         MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
       depends_on:
         - postgres
       command: sh -c "npx prisma migrate deploy && node server.js"

   volumes:
     postgres_data:
   ```

4. **Run:**
   ```bash
   docker-compose up -d
   ```

## Environment Variables

Required for production:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL
- `MINIO_ENDPOINT` - MinIO server endpoint
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `MINIO_BUCKET` - MinIO bucket name (default: projects)

## Architecture

- **Standalone output mode:** Next.js builds a minimal production bundle
- **Multi-stage build:** Optimized Docker image (~200MB)
- **Prisma migrations:** Run automatically on container start
- **Health checks:** PostgreSQL and MinIO services wait until healthy

## Troubleshooting

**Build fails:**

- Ensure `output: "standalone"` is in `next.config.ts`
- Check that all dependencies are in `package.json`

**Prisma client not found:**

- The Dockerfile copies `app/generated/prisma` to the standalone output
- Verify `prisma/schema.prisma` has `output = "../app/generated/prisma"`

**Image optimization issues:**

- The app uses `next/image` with MinIO for remote images
- Ensure MinIO is accessible from the container network
