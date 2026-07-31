# Product Requirements Document (PRD)
## Mohammadia Tahfizul Quran Madrasha Management System

---

## 1. Product Overview

**Product Name:** Mohammadia Tahfizul Quran Madrasha Management System
**UI Language:** Bangla (entire interface will be in Bangla, as many madrasha staff are not comfortable with English)
**Model:** Dynamic Admin Panel — Admin can add, edit, and delete everything
**Target Users:** Madrasha Admin/Principal, Teachers, and Committee Members

---

## 2. Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js** | Frontend + Backend (API Routes) |
| **Tailwind CSS** | UI Styling |
| **Supabase** | Database + Authentication + Realtime |
| **ImageKit.io** | Student/Teacher photo storage |
| **GitHub** | Code version control |
| **Vercel** | Hosting & Deployment |

---

## 3. User Roles

| Role | Access |
|---|---|
| **Super Admin** | Full system access — can add, edit, and delete everything |
| **Teacher** | Can view and submit attendance & results for their own class only |

---

## 4. Core Modules

---

### 4.1 Dashboard

The first screen shown after admin login.

**Dashboard will display:**
- Total number of students (broken down by department — Nurani, Nazera, Hifz, Kitab)
- Total number of teachers
- Total fee collected this month
- Total dues/outstanding this month
- Today's attendance summary
- Recent activity log

---

### 4.2 Student Management

**Fields required when adding a student:**
- Student name (in Bangla)
- Father's name
- Mother's name
- Guardian's mobile number
- Address
- Date of birth
- Admission date
- Department (Nurani / Nazera / Hifz / Kitab)
- Class/Jamaat
- Student photo (uploaded to ImageKit.io)
- Monthly fee amount
- Lillah Boarding (Yes/No) — free students
- Hostel resident (Yes/No)
- Student ID (auto-generated)

**Student list features:**
- Search by name or student ID
- Filter by department
- Edit and delete button next to each student
- View student profile

---

### 4.3 Department & Class (Jamaat) Management

**Four Departments:**

#### a) Nurani Department
- For beginners learning Arabic letters and pronunciation (Nurani Qaida)
- Track progress through Nurani Qaida lessons (lesson number/page)
- Record how much has been completed
- Teacher's remarks/notes

#### b) Nazera Department
- Track progress by Para (section of Quran) and Surah
- Record how much has been read/completed

#### c) Hifz Department (Most unique & important)
- Daily Sabaq (new memorization) record
- Manzil (old lesson revision) record
- Dawr (full revision) tracking
- Track which Para the student has memorized up to
- Teacher's remarks/notes

#### d) Kitab Department
- Jamaat-based (e.g., Mishkat, Hidaya, etc.)
- Subject-wise results
- Record of class/jamaat promotions

**Admin can:**
- Add new Jamaat/Class
- Edit Jamaat name
- Delete Jamaat
- Assign a teacher to a Jamaat

---

### 4.4 Teacher Management

**Fields required when adding a teacher:**
- Teacher's name
- Mobile number
- Address
- Qualification
- Experience
- Which Jamaat they teach
- Monthly salary
- Joining date
- Photo (uploaded to ImageKit.io)

**Teacher list features:**
- Full list of all teachers
- Edit and delete options
- View teacher profile

**Teacher Salary:**
- Record monthly salary payments
- Mark as paid/unpaid
- Generate salary receipt

---

### 4.5 Fee Management (Students)

**When collecting a fee:**
- Select student
- Select month
- Amount auto-populated from student profile
- Mark as paid
- Generate and print receipt

**Fee Report will show:**
- How many students have paid
- How many students have dues
- Total collected
- Total outstanding/due
- Filter by department

**Lillah Students:**
- Tracked separately
- No fee required but still appear in the student list

---

### 4.6 Attendance Management

**Daily attendance flow:**
- Select date
- Select Jamaat/Department
- Mark each student as present or absent
- Option to mark all present at once, then unmark absentees

**Attendance Report:**
- Monthly attendance report per student
- Number of days absent per student
- Attendance percentage

**Prayer Attendance (Optional):**
- Ability to track attendance for all 5 daily prayers

---

### 4.7 Exam & Result Management

**When creating an exam:**
- Exam name (e.g., Half-Yearly, Annual)
- Select department and Jamaat
- Exam date
- Subjects and total marks

**When entering results:**
- Enter marks per student per subject
- Total marks auto-calculated
- Pass/Fail determined automatically

**Result Reports:**
- Merit List (ranked by marks)
- Individual Report Card
- Print functionality

---

### 4.8 Hostel / Boarding Management

**Hostel tracking includes:**
- Which students live in the hostel
- Room number assignment
- Hostel fees recorded separately
- Separate list for Lillah (free) hostel students

---

### 4.9 Committee Management

**Fields when adding a committee member:**
- Member name
- Designation (e.g., President, General Secretary, Treasurer, Member)
- Mobile number
- Address
- Photo (uploaded to ImageKit.io)
- Term start and end date

**Committee page features:**
- All members listed, sorted by designation/rank
- Edit and delete options
- Add new member button

---

### 4.10 Reports & Income/Expense Tracking

**Income tracking:**
- Monthly fee collection
- Admission fees
- Other income

**Expense tracking:**
- Teacher salaries
- Utility bills (electricity, water, etc.)
- Maintenance and construction costs

**Reports:**
- Monthly income/expense report
- Annual report
- Print functionality

---

## 5. Database Schema (Supabase)

### Tables:

```
students
- id, name, father_name, mother_name, guardian_phone
- address, date_of_birth, admission_date
- department (nurani/nazera/hifz/kitab), class_id
- monthly_fee, is_lillah (boolean), is_hostel (boolean)
- photo_url, student_id (auto-generated), created_at

teachers
- id, name, phone, address, qualification
- experience, class_id, monthly_salary
- joining_date, photo_url, created_at

classes
- id, name, department, teacher_id, created_at

attendance
- id, student_id, date, status (present/absent), created_at

hifz_progress
- id, student_id, date, sabaq, manzil, dawr, notes, created_at

fee_collection
- id, student_id, month, year, amount, paid_date
- receipt_number, created_at

exams
- id, name, class_id, exam_date, total_marks, created_at

results
- id, exam_id, student_id, marks_obtained, created_at

teacher_salary
- id, teacher_id, month, year, amount, paid_date, created_at

committee_members
- id, name, position, phone, address
- photo_url, term_start, term_end, created_at

expenses
- id, title, amount, category, expense_date, created_at

users
- id, email, role (admin/teacher), teacher_id, created_at
```

---

## 6. Page Structure (Next.js)

```
/app
  /login                    → Login page
  /dashboard                → Dashboard
  /students                 → Student list
    /add                    → Add new student
    /[id]                   → Student profile
    /[id]/edit              → Edit student
  /teachers                 → Teacher list
    /add                    → Add new teacher
    /[id]                   → Teacher profile
    /[id]/edit              → Edit teacher
  /classes                  → Jamaat/Class management
  /attendance               → Attendance
  /hifz                     → Hifz progress tracking
  /fees                     → Fee collection
  /exams                    → Exams & results
  /hostel                   → Hostel management
  /committee                → Committee page
  /reports                  → Reports & financials
  /settings                 → Settings
```

---

## 7. Folder Structure

```
/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── layout.tsx          → Sidebar + Header layout
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── classes/
│   │   ├── attendance/
│   │   ├── hifz/
│   │   ├── fees/
│   │   ├── exams/
│   │   ├── hostel/
│   │   ├── committee/
│   │   ├── reports/
│   │   └── settings/
│   └── api/
│       ├── students/
│       ├── teachers/
│       ├── attendance/
│       ├── fees/
│       └── ...
├── components/
│   ├── ui/                     → Base UI components
│   ├── forms/                  → Form components
│   ├── tables/                 → Table components
│   └── layout/                 → Sidebar, Header
├── lib/
│   ├── supabase.ts             → Supabase client
│   ├── imagekit.ts             → ImageKit config
│   └── utils.ts                → Helper functions
├── types/
│   └── index.ts                → TypeScript types
└── public/
```

---

## 8. UI/UX Guidelines

### Language — Fully in Bangla
The ENTIRE admin panel interface must be in Bangla. This includes:
- Sidebar menu items (e.g., "ড্যাশবোর্ড", "ছাত্র তালিকা", "বেতন আদায়")
- All page titles and headings
- All form labels (e.g., "ছাত্রের নাম", "পিতার নাম", "মোবাইল নম্বর")
- All buttons (e.g., "যোগ করুন", "সম্পাদনা করুন", "মুছুন", "সংরক্ষণ করুন")
- All table column headers
- All success, error, and validation messages (e.g., "সফলভাবে সংরক্ষিত হয়েছে", "এই তথ্যটি আবশ্যক")
- All placeholder text in input fields
- All confirmation dialogs (e.g., "আপনি কি নিশ্চিত যে মুছে ফেলতে চান?")
- All dropdown options
- All notification and alert messages
- Dashboard stat labels and report headings

### Other UI/UX Rules
- **Simple interface** — designed for users with limited tech experience
- **Mobile responsive** — works well on mobile devices
- **Sidebar navigation** — easy access to all pages
- **Color theme:** Green and white (Islamic theme)
- **Font:** Bangla font support — use **Hind Siliguri** or **Noto Sans Bengali** via Google Fonts

---

## 9. Development Phases

### Phase 1 (Build First):
- Login system (Supabase Auth)
- Dashboard
- Student management
- Fee collection
- Committee page

### Phase 2:
- Teacher management
- Attendance tracking
- Hifz progress tracking

### Phase 3:
- Exam & result management
- Hostel management
- Reports & income/expense tracking

---

## 10. Special Notes

- System will be sold as a **one-time purchase** (not SaaS/subscription)
- Each madrasha's data will be separated using a unique `madrasha_id`
- Photos will be uploaded to **ImageKit.io**; only the URL will be stored in Supabase
- All form validation messages will display in Bangla
- Receipts and reports will have **print** functionality

---

*Document Created: June 2026*
*Developer: [Your Name]*
*Product: Mohammadia Tahfizul Quran Madrasha Management System*
