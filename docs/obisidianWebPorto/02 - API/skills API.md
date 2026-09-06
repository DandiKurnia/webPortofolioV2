# Skills API

Files: 
- `app/api/skills/route.ts`
- `app/api/skills/[id]/route.ts`

## `GET /api/skills`
- **Access**: Public
- **Returns**: Array of all `Skill` ordered by `createdAt` desc.

## `POST /api/skills`
- **Access**: Protected (NextAuth session)
- **Body**: `{ title, description, icon }`
- **Returns**: Created `Skill`.

## `GET /api/skills/[id]`
- **Access**: Public
- **Returns**: Single `Skill`.

## `PUT /api/skills/[id]`
- **Access**: Protected
- **Body**: `{ title, description, icon }`
- **Returns**: Updated `Skill`.

## `DELETE /api/skills/[id]`
- **Access**: Protected
- **Returns**: `{ message }`
