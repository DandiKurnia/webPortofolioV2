# Certification CRUD Implementation

## Database Schema

Added `Certification` model to `prisma/schema.prisma`:
- `id`: String (primary key, auto-generated)
- `title`: String (certificate name)
- `company`: String (issuing organization)
- `link`: String (optional, certificate URL)
- `years`: String (year obtained)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

## API Routes

### GET /api/certifications
- Fetches all certifications
- Ordered by creation date (newest first)
- No authentication required (public endpoint)

### POST /api/certifications
- Creates a new certification
- Requires authentication (NextAuth session)
- Required fields: title, company, years
- Optional field: link

### GET /api/certifications/[id]
- Fetches a single certification by ID
- Returns 404 if not found
- No authentication required

### PUT /api/certifications/[id]
- Updates an existing certification
- Requires authentication (NextAuth session)
- Required fields: title, company, years
- Optional field: link

### DELETE /api/certifications/[id]
- Deletes a certification by ID
- Requires authentication (NextAuth session)
- Returns success message on completion

## Frontend Implementation

Updated `app/admin/(dashboard)/certificates/page.tsx` with:

### Features
1. **List View**
   - Displays all certifications in a table
   - Shows ID, title, company, year
   - Real-time data fetching from API

2. **Search Functionality**
   - Filter certifications by title or company
   - Case-insensitive search
   - Updates results in real-time

3. **Add Certification**
   - Modal form with fields: title, company, link (optional), years
   - Form validation (required fields)
   - Success feedback and automatic list refresh

4. **Edit Certification**
   - Opens modal pre-filled with existing data
   - Updates certification via PUT request
   - Automatic list refresh on success

5. **Delete Certification**
   - Confirmation dialog before deletion
   - Removes certification from database
   - Automatic list refresh on success

### UI Components
- Brutalist design matching the existing admin theme
- Responsive table layout
- Modal overlay for add/edit forms
- Loading states for async operations
- Error handling with user feedback

## Seed Data

Added 3 sample certifications in `prisma/seed.ts`:
1. Data Privacy Fundamentals - Google (2023)
2. AWS Certified Solutions Architect - Amazon Web Services (2024)
3. Professional Scrum Master I - Scrum.org (2023)

## Testing

All CRUD operations tested and working:
- ✅ Create new certification
- ✅ Read all certifications
- ✅ Read single certification
- ✅ Update certification
- ✅ Delete certification
- ✅ Search/filter certifications

## Access

- Admin panel: http://localhost:3000/admin/certificates
- API endpoint: http://localhost:3000/api/certifications
- Login credentials: admindandi@admin.com / dandi3105
