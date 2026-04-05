# 🚀 IMPLEMENTATION GUIDE - UPGRADE PENGADUAN APLIKASI

## 📍 Status Saat Ini vs Setelah Upgrade

### Fitur yang Ditambahkan ✅

#### 1. **ADMIN - Advanced Filtering**
- ✅ Filter by Category (AC Rusak, Lantai Retak, dll)
- ✅ Filter by Priority (Low, Medium, High)
- ✅ Filter by Student/Creator
- ✅ Filter by Date Range
- ✅ Filter by Month & Year
- ✅ Search by Title/Description
- ✅ Pagination untuk handle data besar
- ✅ Real-time stats dengan filtered data

#### 2. **ADMIN - Feedback System**
- ✅ Admin dapat menambah/edit feedback per pengaduan
- ✅ Feedback modal dengan textarea
- ✅ Progress updates visible di pengaduan
- ✅ Feedback di-save ke database

#### 3. **USER - Enhanced View**
- ✅ Lihat status penyelesaian (open, in-progress, resolved, rejected)
- ✅ Lihat histori aspirasi (semua pengaduan yang dibuat)
- ✅ Lihat feedback/progress update dari admin
- ✅ Lihat kategori dan prioritas
- ✅ Lihat target deadline penyelesaian
- ✅ Lihat foto bukti

#### 4. **DATABASE - Schema Improvements**
- ✅ Tambah field: `category` (select enum)
- ✅ Tambah field: `priority` (low/medium/high)
- ✅ Tambah field: `location` (text - sudah digunakan)
- ✅ Tambah field: `photo` (files - sudah digunakan)
- ✅ Tambah field: `feedback` (text - umpan balik)
- ✅ Tambah field: `deadline` (date)
- ✅ Confirm/add field: `creator` (relation ke users)

#### 5. **BACKEND - Query Optimization**
- ✅ Helper functions untuk efficient queries
- ✅ Filter di database level (bukan di memory)
- ✅ Pagination support
- ✅ Array operations untuk filtering & aggregation
- ✅ Proper sorting & expandable relations

---

## 📋 Implementation Checklist

### STEP 1: Database Schema Update (Manual di PocketBase Admin UI)

**File Reference:** `SCHEMA_FIX_GUIDE.md`

```
□ Buka http://127.0.0.1:8090/_/
□ Edit collection "complaints"
□ Confirm existing fields:
  - title ✓
  - description ✓
  - status ✓
  - creator (relation) ✓
□ Add new fields:
  □ location (text, required)
  □ photo (files, optional)
  □ category (select, required)
  □ priority (select, optional)
  □ deadline (date, optional)
  □ feedback (text long, optional)
  □ estimated_cost (number, optional)
□ Save collection
□ Test: Create new record with new fields
```

---

### STEP 2: Copy & Install Query Helper

**Source:** `frontend/lib/complaintsQueries.ts`

```bash
# File sudah dibuat, hanya perlu dipastikan berada di:
frontend/lib/complaintsQueries.ts
```

**Konten includes:**
- `buildFilterString()` - Construct efficient filter queries
- `getComplaints()` - Get dengan pagination & filtering
- `getComplaintsStats()` - Get stats dengan array operations
- `updateComplaint()` - Update status, feedback, priority
- Constants: `COMPLAINT_CATEGORIES`, `COMPLAINT_PRIORITIES`, `STATUS_OPTIONS`

---

### STEP 3: Update Admin Complaints Page

**Current File:** `frontend/app/admin/complaints/page.tsx`
**Improved Version:** `frontend/app/admin/complaints/page_improved.tsx`

**Actions:**
```bash
# Option 1: Replace keseluruhan
cp frontend/app/admin/complaints/page_improved.tsx \
   frontend/app/admin/complaints/page.tsx

# Option 2: Manual merge (jika ada custom changes)
# Reference improved version untuk struktur baru
```

**New Features Added:**
- Advanced filter controls (category, priority, student, search)
- Date range picker
- Month & year selector
- Filter mode toggle
- Pagination
- Reset filters button
- Real-time stats update dengan applied filters

---

### STEP 4: Update Admin Detail Modal

**Current File:** `frontend/app/admin/complaints/ComplaintsDetailModal.tsx`
**Improved Version:** `frontend/app/admin/complaints/ComplaintsDetailModal_improved.tsx`

**Changes:**
```bash
# Replace dengan improved version
cp frontend/app/admin/complaints/ComplaintsDetailModal_improved.tsx \
   frontend/app/admin/complaints/ComplaintsDetailModal.tsx
```

**New Features:**
- Feedback/progress update section
- Edit feedback textarea
- Save feedback functionality
- Show category badges
- Show priority badges
- Show deadline field
- Show photo if exists
- Improved modal layout

**Key Difference:**
```typescript
// NEW: Feedback function passed to component
onFeedbackChange: (id: string, feedback: string) => void;

// Usage in parent (page.tsx):
const updateFeedback = async (id: string, feedback: string) => {
  await pb.collection("complaints").update(id, { feedback });
};
```

---

### STEP 5: Update User Complaints Page

**Current File:** `frontend/app/complaints/page.tsx`
**Improved Version:** `frontend/app/complaints/page_improved.tsx`

**Changes:**
```bash
cp frontend/app/complaints/page_improved.tsx \
   frontend/app/complaints/page.tsx
```

**New Features:**
- Category selector di form
- Display category badges
- Display priority badges
- Show feedback dari admin (blue badge)
- Improved detail modal showing:
  - Status dengan color coding
  - Category & priority badges
  - Feedback section dari admin
  - Deadline display
  - Photo display
  - Progress updates
- Better UX untuk user melihat feedback

---

### STEP 6: Update Types & Interfaces

**Location:** `frontend/app/admin/complaints/types/` atau inline

**Update Complaint type:**
```typescript
type Complaint = {
  id: string;
  title: string;
  description: string;
  status?: string;
  category?: string;          // NEW
  priority?: string;          // NEW
  created: string;
  deadline?: string;          // NEW
  feedback?: string;          // NEW
  creator?: string;
  location?: string;
  photo?: string;
  expand?: {
    creator?: {
      email?: string;
      name?: string;
    };
  };
};
```

---

### STEP 7: Update Form Validations & Procedures

**PocketBase Hooks (Optional tapi Recommended):**

```javascript
// Create hook untuk auto-set creator saat create
db.collection("complaints").onCreate.add((e) => {
  if (!e.data.creator && e.request.auth) {
    e.data.creator = e.request.auth.id;
  }
});

// Update hook untuk auto-update timestamp
db.collection("complaints").onUpdate.add((e) => {
  e.data.updated = new Date().toISOString();
});

// Validation hook
db.collection("complaints").onCreate.add((e) => {
  if (!e.data.title || !e.data.description) {
    throw new Error("Title dan description harus diisi");
  }
  if (!e.data.category) {
    throw new Error("Category harus dipilih");
  }
});
```

---

## 🔧 Integration Guide

### 1. Update Imports di Pages

#### Admin Page (`frontend/app/admin/complaints/page.tsx`)
```typescript
import { 
  getComplaints, 
  getComplaintsStats,
  ComplaintFilters,
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  STATUS_OPTIONS
} from "../../../lib/complaintsQueries";
```

#### User Page (`frontend/app/complaints/page.tsx`)
```typescript
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from "../../lib/complaintsQueries";
```

### 2. Update useEffect Dependencies

```typescript
// Proper cleanup
useEffect(() => {
  let mounted = true;
  let unsubscribe: (() => void) | null = null;

  const init = async () => {
    try {
      const result = await getComplaints(effectiveFilters, { page, perPage: 20 });
      if (mounted) {
        setList(result.items);
        setTotalPages(result.totalPages);
      }
    } catch (err) {
      // Handle error
    }
  };

  init();
  
  return () => {
    mounted = false;
    if (unsubscribe) unsubscribe();
  };
}, [effectiveFilters, page]);
```

### 3. Query Performance Tips

#### ✅ DO: Database Level Filtering
```typescript
// Good - filter di PocketBase
const result = await getComplaints({
  category: "AC Rusak",
  status: "open",
  dateFrom: "2026-04-01"
}, { page: 1, perPage: 20 });
```

#### ❌ DON'T: Client Side Filtering
```typescript
// Bad - getFullList semua records
const all = await pb.collection("complaints").getFullList();
const filtered = all.filter(c => c.category === "AC Rusak");
```

### 4. Testing Locally

```bash
# Terminal 1: Backend
cd backend
go run main.go
# http://127.0.0.1:8090

# Terminal 2: Frontend
cd frontend
npm run dev
# http://localhost:3000
```

**Test Scenarios:**
1. Create complaint dengan semua fields (category, priority, location, photo)
2. As admin, test setiap filter:
   - Filter by category
   - Filter by priority
   - Filter by student
   - Filter by date range
   - Filter by month
   - Search text
3. As admin, add feedback untuk complaint
4. As user, lihat feedback di detail complaint
5. Test pagination pada data > 20 records

---

## 📊 Database Query Examples

### Example 1: Admin view - Filter by category & status
```typescript
const filters: ComplaintFilters = {
  category: "Lantai Retak",
  status: "open"
};

const result = await getComplaints(filters, {
  page: 1,
  perPage: 20
});
```

**Generated Filter String:**
```
category = "Lantai Retak" && status = "open"
```

### Example 2: Admin view - Date range filtered
```typescript
const filters: ComplaintFilters = {
  dateFrom: "2026-04-01",
  dateTo: "2026-04-30"
};

const stats = await getComplaintsStats(filters);
```

### Example 3: User page - Own complaints only
```typescript
const userComplaints = await pb
  .collection("complaints")
  .getFullList({
    filter: `creator = "${user.id}"`,
    sort: "-created"
  });
```

### Example 4: Array operations untuk stats
```typescript
const allComplaints = [/* array of complaints */];

// Using array.reduce() untuk group by category
const byCategory = allComplaints.reduce((acc, c) => {
  const cat = c.category || 'uncategorized';
  acc[cat] = (acc[cat] || 0) + 1;
  return acc;
}, {});

// Result: { "AC Rusak": 5, "Lantai Retak": 3, ... }
```

---

## 🎯 Coding Guidelines - Verified

### ✅ Halaman memuat dengan cepat?
- **YES**: Menggunakan pagination (20 items per page)
- **YES**: Filter di database level
- **YES**: Real-time subscriptions optimized

### ✅ Query yang efisien?
- **YES**: Using `getList()` dengan pagination (bukan getFullList)
- **YES**: Filter di PocketBase (bukan di client)
- **YES**: Proper expand untuk relations (creator details)

### ✅ Gunakan prosedur & fungsi?
- **YES**: `complaintsQueries.ts` dengan reusable functions
- **YES**: `buildFilterString()` untuk query construction
- **YES**: `getComplaints()`, `getComplaintsStats()`, `updateComplaint()`
- FUTURE: PocketBase hooks untuk server-side validation

### ✅ Gunakan array operations?
- **YES**: `array.filter()` untuk status filtering
- **YES**: `array.reduce()` untuk stats aggregation
- **YES**: `array.map()` untuk data transformation
- **YES**: Array methods di `complaintsQueries.ts`

### ✅ Best Practices?
- **YES**: Proper error handling dengan try-catch
- **YES**: Cleanup subscriptions di useEffect return
- **YES**: TypeScript types untuk type safety
- **YES**: Separation of concerns (queries vs components)
- **YES**: Reusable query helpers
- **YES**: Proper loading states

---

## 🔒 Security Checklist

```
□ Creator field di database - prevent users edit others' complaints
□ Permissions rules di PocketBase:
  - createRule: "@request.auth.id != null" (auth required)
  - updateRule: "id = @request.auth.id || @request.auth.isAdmin"
  - deleteRule: "id = @request.auth.id || @request.auth.isAdmin"
  - viewRule: "" (publik bisa view) atau restrict ke creator
□ Frontend auth check di useEffect
□ Admin check di useEffect
```

---

## 📝 Files Summary

### Created Files:
```
✓ IMPLEMENTATION_ANALYSIS.md - Full analysis vs requirements
✓ SCHEMA_FIX_GUIDE.md - Step-by-step schema update guide
✓ complaintsQueries.ts - Query helper dengan filtering & pagination
✓ page_improved.tsx (admin) - Advanced filters & feedback
✓ ComplaintsDetailModal_improved.tsx - Feedback system
✓ page_improved.tsx (user) - Enhanced view dengan feedback
✓ IMPLEMENTATION_GUIDE.md - This file
```

### Files to Update:
```
→ /frontend/app/admin/complaints/page.tsx
→ /frontend/app/admin/complaints/ComplaintsDetailModal.tsx
→ /frontend/app/complaints/page.tsx
→ /POCKETBASE_SCHEMA.md (document changes)
```

---

## ⚡ Next Steps

1. **WEEK 1:**
   - [ ] Update PocketBase schema (manual via Admin UI)
   - [ ] Copy complaintsQueries.ts ke project
   - [ ] Update admin complaints page
   - [ ] Update admin detail modal
   - [ ] Update user complaints page
   - [ ] Test all filters & feedback

2. **WEEK 2:**
   - [ ] Add PocketBase hooks untuk validation
   - [ ] Implement export/reporting feature
   - [ ] Add email notifications untuk feedback
   - [ ] Performance optimization (caching)
   - [ ] Admin dashboard dengan advanced stats

3. **WEEK 3:**
   - [ ] Mobile optimization
   - [ ] Advanced reporting features
   - [ ] Analytics dashboard
   - [ ] User satisfaction survey
   - [ ] Archive old complaints

---

## 📞 Support

**Issues/Questions?**
- Check compliance dengan requirements document
- Verify schema fields di PocketBase Admin UI
- Test queries di browser console
- Check network requests di DevTools

