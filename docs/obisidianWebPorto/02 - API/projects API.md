# Projects API

Files: 
- `app/api/projects/route.ts`
- `app/api/projects/[id]/route.ts`

## `GET /api/projects`
- **Access**: Public
- **Returns**: Array of all `Project` ordered by `createdAt` desc.

## `POST /api/projects`
- **Access**: Protected
- **Body**: `{ title, description, link, image, technologies }`
- **Returns**: Created `Project`.

## `GET /api/projects/[id]`
- **Access**: Public
- **Returns**: Single `Project`.

## `PUT /api/projects/[id]`
- **Access**: Protected
- **Body**: `{ title, description, link, image, technologies }`
- **Returns**: Updated `Project`.

## `DELETE /api/projects/[id]`
- **Access**: Protected
- **Returns**: `{ message }`
