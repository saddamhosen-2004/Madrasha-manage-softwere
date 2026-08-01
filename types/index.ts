export interface Madrasha {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  tagline?: string;
  established_year?: string;
  principal_name?: string;
  created_at?: string;
}

export interface Class {
  id: string;
  name: string;
  department: 'nurani' | 'nazera' | 'hifz' | 'kitab';
  teacher_id?: string;
  madrasha_id: string;
  created_at?: string;
  teacher_name?: string; // joined
}

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  address: string;
  qualification: string;
  experience: string;
  class_id?: string;
  monthly_salary: number;
  joining_date: string;
  photo_url?: string;
  madrasha_id: string;
  created_at?: string;
  class_name?: string; // joined
}

export interface Student {
  id: string;
  student_id: string; // MTQ-xxxx
  name: string;
  father_name: string;
  mother_name: string;
  guardian_phone: string;
  address: string;
  date_of_birth: string;
  admission_date: string;
  department: 'nurani' | 'nazera' | 'hifz' | 'kitab';
  class_id?: string;
  monthly_fee: number;
  is_lillah: boolean;
  is_hostel: boolean;
  photo_url?: string;
  madrasha_id: string;
  created_at?: string;
  class_name?: string; // joined
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent';
  madrasha_id: string;
  created_at?: string;
}

export interface HifzProgress {
  id: string;
  student_id: string;
  date: string;
  sabaq?: string;
  manzil?: string;
  dawr?: string;
  notes?: string;
  madrasha_id: string;
  created_at?: string;
}

export interface FeeCollection {
  id: string;
  student_id: string;
  month: number; // 1-12
  year: number;
  amount: number;
  paid_date: string;
  receipt_number: string;
  madrasha_id: string;
  created_at?: string;
}

export interface Exam {
  id: string;
  name: string;
  class_id: string;
  exam_date: string;
  total_marks: number;
  madrasha_id: string;
  created_at?: string;
  class_name?: string; // joined
}

export interface Result {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  madrasha_id: string;
  created_at?: string;
  student_name?: string; // joined
  student_code?: string; // joined
}

export interface TeacherSalary {
  id: string;
  teacher_id: string;
  month: number;
  year: number;
  amount: number;
  paid_date: string;
  madrasha_id: string;
  created_at?: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  position: string;
  phone: string;
  address: string;
  photo_url?: string;
  term_start?: string;
  term_end?: string;
  madrasha_id: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  madrasha_id: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'teacher';
  teacher_id?: string;
  madrasha_id: string;
  created_at?: string;
}
