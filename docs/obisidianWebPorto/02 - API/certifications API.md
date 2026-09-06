# Certifications API

Files: 
- `app/api/certifications/route.ts`
- `app/api/certifications/[id]/route.ts`

## `GET /api/certifications`
- **Access**: Public
- **Returns**: Array of all `Certification` ordered by `createdAt` desc.

## `POST /api/certifications`
- **Access**: Protected
- **Body**: `{ title, company, link, years }`
- **Returns**: Created `Certification`.

## `GET /api/certifications/[id]`
- **Access**: Public
- **Returns**: Single `Certification`.

## `PUT /api/certifications/[id]`
- **Access**: Protected
- **Body**: `{ title, company, link, years }`
- **Returns**: Updated `Certification`.

## `DELETE /api/certifications/[id]`
- **Access**: Protected
- **Returns**: `{ message }`
