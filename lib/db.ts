import { supabase, isSupabaseConfigured } from './supabase';
import { 
  Madrasha, Class, Teacher, Student, Attendance, 
  HifzProgress, FeeCollection, Exam, Result, 
  TeacherSalary, CommitteeMember, Expense, UserProfile 
} from '../types';

// Hardcoded Madrasha ID for local/mock development
const MOCK_MADRASHA_ID = 'mtq-madrasha-12345';

// Mock Initial Data Seed
const SEED_MADRASHA: Madrasha = {
  id: MOCK_MADRASHA_ID,
  name: 'মোহাম্মাদীয়া তাহফীযুল কুরআন মাদ্রাসা',
  address: 'মিরপুর-১১, ঢাকা-১২১৬',
  created_at: new Date().toISOString()
};

const SEED_CLASSES: Class[] = [
  { id: 'class-1', name: 'নূরানী ১ম জামাত', department: 'nurani', teacher_id: 'teacher-1', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'class-2', name: 'নাজেরা ১ম বিভাগ', department: 'nazera', teacher_id: 'teacher-2', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'class-3', name: 'হিফজ বিভাগ ক', department: 'hifz', teacher_id: 'teacher-1', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'class-4', name: 'মিশকাত জামাত', department: 'kitab', teacher_id: 'teacher-3', madrasha_id: MOCK_MADRASHA_ID },
];

const SEED_TEACHERS: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'হাফেজ মাওলানা আব্দুর রহমান',
    phone: '০১৭১২৩৪৫৬৭৮',
    address: 'মিরপুর, ঢাকা',
    qualification: 'দাওরায়ে হাদিস, হিফজ সম্পন্ন',
    experience: '৫ বছর',
    class_id: 'class-3',
    monthly_salary: 15000,
    joining_date: '2024-01-01',
    photo_url: '',
    madrasha_id: MOCK_MADRASHA_ID
  },
  {
    id: 'teacher-2',
    name: 'মাওলানা মুফতি কারী ইউসুফ',
    phone: '০১৮১২৩৪৫৬৭৮',
    address: 'উত্তরা, ঢাকা',
    qualification: 'দাওরায়ে হাদিস, ক্বিরাত কোর্স',
    experience: '৮ বছর',
    class_id: 'class-2',
    monthly_salary: 18000,
    joining_date: '2023-05-15',
    photo_url: '',
    madrasha_id: MOCK_MADRASHA_ID
  },
  {
    id: 'teacher-3',
    name: 'মাওলানা নোমান আহমেদ',
    phone: '০১৯১২৩৪৫৬৭৮',
    address: 'মোহাম্মদপুর, ঢাকা',
    qualification: 'কামিল, আদীব',
    experience: '৩ বছর',
    class_id: 'class-4',
    monthly_salary: 16000,
    joining_date: '2025-02-10',
    photo_url: '',
    madrasha_id: MOCK_MADRASHA_ID
  }
];

const SEED_STUDENTS: Student[] = [
  {
    id: 'student-1',
    student_id: 'MTQ-০০১',
    name: 'আহমেদ আব্দুল্লাহ',
    father_name: 'আব্দুর রহিম',
    mother_name: 'ফাতেমা বেগম',
    guardian_phone: '০১৭০০০০০১১১',
    address: 'মিরপুর-১২, ঢাকা',
    date_of_birth: '2018-05-12',
    admission_date: '2025-01-01',
    department: 'nurani',
    class_id: 'class-1',
    monthly_fee: 1000,
    is_lillah: false,
    is_hostel: false,
    photo_url: '',
    madrasha_id: MOCK_MADRASHA_ID
  },
  {
    id: 'student-2',
    student_id: 'MTQ-০০২',
    name: 'আব্দুর রহমান শাকিল',
    father_name: 'আবুল কালাম',
    mother_name: 'আয়েশা খাতুন',
    guardian_phone: '০১৮০০০০০২২২',
    address: 'মিরপুর-১০, ঢাকা',
    date_of_birth: '2016-08-20',
    admission_date: '2024-06-15',
    department: 'nazera',
    class_id: 'class-2',
    monthly_fee: 1200,
    is_lillah: false,
    is_hostel: true,
    photo_url: '',
    madrasha_id: MOCK_MADRASHA_ID
  },
  {
    id: 'student-3',
    student_id: 'MTQ-০০৩',
    name: 'মোহাম্মদ সালমান',
    father_name: 'রফিকুল ইসলাম',
    mother_name: 'জান্নাতুল ফেরদৌস',
    guardian_phone: '০১৯০০০০০৩৩৩',
    address: 'পল্লবী, মিরপুর',
    date_of_birth: '2014-03-05',
    admission_date: '2023-01-10',
    department: 'hifz',
    class_id: 'class-3',
    monthly_fee: 1500,
    is_lillah: false,
    is_hostel: true,
    photo_url: '',
    madrasha_id: MOCK_MADRASHA_ID
  },
  {
    id: 'student-4',
    student_id: 'MTQ-০০৪',
    name: 'তামিম ইকবাল',
    father_name: 'আফজাল হোসেন',
    mother_name: 'রেহানা পারভীন',
    guardian_phone: '০১৫০০০০০৪৪৪',
    address: 'উত্তরা, ঢাকা',
    date_of_birth: '2011-11-15',
    admission_date: '2022-02-15',
    department: 'kitab',
    class_id: 'class-4',
    monthly_fee: 2000,
    is_lillah: false,
    is_hostel: true,
    photo_url: '',
    madrasha_id: MOCK_MADRASHA_ID
  },
  {
    id: 'student-5',
    student_id: 'MTQ-০০৫',
    name: 'সাকিব আল হাসান',
    father_name: 'মৃত করিম উল্লাহ',
    mother_name: 'সুফিয়া বেগম',
    guardian_phone: '০১৬০০০০০৫৫৫',
    address: 'কুমিল্লা',
    date_of_birth: '2013-09-25',
    admission_date: '2024-01-05',
    department: 'hifz',
    class_id: 'class-3',
    monthly_fee: 0,
    is_lillah: true,
    is_hostel: true,
    photo_url: '',
    madrasha_id: MOCK_MADRASHA_ID
  }
];

const SEED_COMMITTEE: CommitteeMember[] = [
  {
    id: 'comm-1',
    name: 'আলহাজ্ব মোহাম্মদ আলী',
    position: 'সভাপতি',
    phone: '০১৭১১১১২২৩৩',
    address: 'মিরপুর, ঢাকা',
    photo_url: '',
    term_start: '2024-01-01',
    term_end: '2027-12-31',
    madrasha_id: MOCK_MADRASHA_ID
  },
  {
    id: 'comm-2',
    name: 'ইঞ্জিনিয়ার ওবায়দুল হক',
    position: 'সাধারণ সম্পাদক',
    phone: '০১৮২২২২৩৩৪৪',
    address: 'মিরপুর ডিওএইচএস',
    photo_url: '',
    term_start: '2024-01-01',
    term_end: '2027-12-31',
    madrasha_id: MOCK_MADRASHA_ID
  }
];

const SEED_EXPENSES: Expense[] = [
  { id: 'exp-1', title: 'বিদ্যুৎ বিল - মে ২০২৬', amount: 3200, category: 'ইউটিলিটি বিল', expense_date: '2026-05-10', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'exp-2', title: 'বাবুর্চি বেতন - মে ২০২৬', amount: 8000, category: 'খাদ্য ও বোর্ডিং', expense_date: '2026-05-05', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'exp-3', title: 'মাদ্রাসা সংস্কার কাজ', amount: 15000, category: 'সংস্কার ও নির্মাণ', expense_date: '2026-06-15', madrasha_id: MOCK_MADRASHA_ID }
];

const SEED_FEES: FeeCollection[] = [
  { id: 'fee-1', student_id: 'student-1', month: 5, year: 2026, amount: 1000, paid_date: '2026-05-04', receipt_number: 'REC-২০২৬০৫০১', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'fee-2', student_id: 'student-2', month: 5, year: 2026, amount: 1200, paid_date: '2026-05-06', receipt_number: 'REC-২০২৬০৫০২', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'fee-3', student_id: 'student-3', month: 5, year: 2026, amount: 1500, paid_date: '2026-05-10', receipt_number: 'REC-২০২৬০৫০৩', madrasha_id: MOCK_MADRASHA_ID }
];

const SEED_SALARY: TeacherSalary[] = [
  { id: 'sal-1', teacher_id: 'teacher-1', month: 5, year: 2026, amount: 15000, paid_date: '2026-06-01', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'sal-2', teacher_id: 'teacher-2', month: 5, year: 2026, amount: 18000, paid_date: '2026-06-01', madrasha_id: MOCK_MADRASHA_ID }
];

const SEED_ATTENDANCE: Attendance[] = [
  { id: 'att-1', student_id: 'student-1', date: '2026-06-28', status: 'present', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'att-2', student_id: 'student-2', date: '2026-06-28', status: 'present', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'att-3', student_id: 'student-3', date: '2026-06-28', status: 'absent', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'att-4', student_id: 'student-4', date: '2026-06-28', status: 'present', madrasha_id: MOCK_MADRASHA_ID },
  { id: 'att-5', student_id: 'student-5', date: '2026-06-28', status: 'present', madrasha_id: MOCK_MADRASHA_ID },
];

const SEED_HIFZ: HifzProgress[] = [
  { id: 'hifz-p-1', student_id: 'student-3', date: '2026-06-28', sabaq: 'পারা ৩০, সূরা নাবা ১-২০ আয়াত', manzil: 'পারা ২৯, সূরা মুলক থেকে নূহ', dawr: 'পারা ২৮ সম্পূর্ণ', notes: 'পড়া ভালো ছিল, সুর সুন্দর', madrasha_id: MOCK_MADRASHA_ID }
];

const SEED_EXAMS: Exam[] = [
  { id: 'exam-1', name: 'অর্ধবার্ষিক পরীক্ষা ২০২৬', class_id: 'class-3', exam_date: '2026-06-10', total_marks: 100, madrasha_id: MOCK_MADRASHA_ID }
];

const SEED_RESULTS: Result[] = [
  { id: 'res-1', exam_id: 'exam-1', student_id: 'student-3', marks_obtained: 85, madrasha_id: MOCK_MADRASHA_ID },
  { id: 'res-2', exam_id: 'exam-1', student_id: 'student-5', marks_obtained: 92, madrasha_id: MOCK_MADRASHA_ID }
];

// Helper to initialize localStorage
const initLocalStorage = () => {
  if (typeof window === 'undefined') return;

  const setItemIfEmpty = (key: string, data: any) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  setItemIfEmpty('madrashas', [SEED_MADRASHA]);
  setItemIfEmpty('classes', SEED_CLASSES);
  setItemIfEmpty('teachers', SEED_TEACHERS);
  setItemIfEmpty('students', SEED_STUDENTS);
  setItemIfEmpty('committee_members', SEED_COMMITTEE);
  setItemIfEmpty('expenses', SEED_EXPENSES);
  setItemIfEmpty('fee_collection', SEED_FEES);
  setItemIfEmpty('teacher_salary', SEED_SALARY);
  setItemIfEmpty('attendance', SEED_ATTENDANCE);
  setItemIfEmpty('hifz_progress', SEED_HIFZ);
  setItemIfEmpty('exams', SEED_EXAMS);
  setItemIfEmpty('results', SEED_RESULTS);
};

// Call initialization immediately
initLocalStorage();

// Generic LocalStorage Helpers
function getLocalItems<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  initLocalStorage();
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : [];
}

function saveLocalItems<T>(key: string, items: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(items));
}

// ----------------------------------------------------
// DATABASE API IMPLEMENTATION (HYBRID SUPABASE/MOCK)
// ----------------------------------------------------

export const db = {
  // Current Madrasha Details
  async getMadrasha(): Promise<Madrasha> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('madrashas')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No madrashas exist in database yet. Auto-create the default one.
          const { data: inserted, error: insertError } = await supabase
            .from('madrashas')
            .insert([{
              name: 'মোহাম্মাদীয়া তাহফীযুল কুরআন মাদ্রাসা',
              address: 'মিরপুর-১১, ঢাকা-১২১৬'
            }])
            .select()
            .single();
          if (insertError) {
            console.error("Failed to auto-seed madrasha in Supabase:", insertError);
            throw new Error(insertError.message);
          }
          return inserted;
        }
        console.error("Supabase error getting madrasha:", error);
        throw new Error(error.message);
      }
      return data;
    }
    return getLocalItems<Madrasha>('madrashas')[0] || SEED_MADRASHA;
  },

  async updateMadrasha(updatedFields: Partial<Madrasha>): Promise<Madrasha> {
    const current = await this.getMadrasha();
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('madrashas')
        .update(updatedFields)
        .eq('id', current.id)
        .select()
        .single();
      if (error) {
        console.error("Supabase error updating madrasha:", error);
        throw new Error(error.message);
      }
      return data;
    }
    const madrashas = getLocalItems<Madrasha>('madrashas');
    const updated = { ...current, ...updatedFields };
    if (madrashas.length > 0) {
      madrashas[0] = updated;
      saveLocalItems('madrashas', madrashas);
    } else {
      saveLocalItems('madrashas', [updated]);
    }
    return updated;
  },

  // Auth Operations
  async getProfile(): Promise<UserProfile | null> {
    if (isSupabaseConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) {
          if (error.code === 'PGRST116') return null;
          console.error("Supabase error getting user profile:", error);
          throw new Error(error.message);
        }
        return data;
      }
      return null;
    }
    if (typeof window === 'undefined') return null;
    const profileStr = localStorage.getItem('user_profile');
    return profileStr ? JSON.parse(profileStr) : null;
  },

  async setMockProfile(role: 'admin' | 'teacher', teacherId?: string) {
    if (typeof window === 'undefined') return;
    const profile: UserProfile = {
      id: role === 'admin' ? 'mock-user-admin-1' : 'mock-user-teacher-1',
      email: role === 'admin' ? 'admin@mtq.com' : 'teacher@mtq.com',
      role,
      teacher_id: teacherId,
      madrasha_id: MOCK_MADRASHA_ID
    };
    localStorage.setItem('user_profile', JSON.stringify(profile));
  },

  async logout() {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_profile');
      }
    }
  },

  // Class Management
  async getClasses(): Promise<Class[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teachers:teacher_id (name)
        `);
      if (error) {
        console.error("Supabase error getting classes:", error);
        throw new Error(error.message);
      }
      return (data || []).map((c: any) => ({
        ...c,
        teacher_name: c.teachers?.name || ''
      }));
    }
    const classes = getLocalItems<Class>('classes');
    const teachers = getLocalItems<Teacher>('teachers');
    return classes.map(c => {
      const t = teachers.find(teach => teach.id === c.teacher_id);
      return { ...c, teacher_name: t ? t.name : '' };
    });
  },

  async addClass(name: string, department: 'nurani' | 'nazera' | 'hifz' | 'kitab', teacherId?: string): Promise<Class> {
    if (isSupabaseConfigured()) {
      const madrasha = await this.getMadrasha();
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          name,
          department,
          teacher_id: teacherId || null,
          madrasha_id: madrasha.id
        }])
        .select()
        .single();
      if (error) {
        console.error("Supabase error adding class:", error);
        throw new Error(error.message);
      }
      return data;
    }

    const newClass: Class = {
      id: 'class-' + Date.now(),
      name,
      department,
      teacher_id: teacherId,
      madrasha_id: MOCK_MADRASHA_ID
    };
    const classes = getLocalItems<Class>('classes');
    classes.push(newClass);
    saveLocalItems('classes', classes);
    return newClass;
  },

  async updateClass(id: string, name: string, department: 'nurani' | 'nazera' | 'hifz' | 'kitab', teacherId?: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('classes')
        .update({ name, department, teacher_id: teacherId || null })
        .eq('id', id);
      if (error) {
        console.error("Supabase error updating class:", error);
        throw new Error(error.message);
      }
      return;
    }
    const classes = getLocalItems<Class>('classes');
    const updated = classes.map(c => c.id === id ? { ...c, name, department, teacher_id: teacherId } : c);
    saveLocalItems('classes', updated);
  },

  async deleteClass(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) {
        console.error("Supabase error deleting class:", error);
        throw new Error(error.message);
      }
      return;
    }
    const classes = getLocalItems<Class>('classes');
    saveLocalItems('classes', classes.filter(c => c.id !== id));
  },

  // Student Management
  async getStudents(): Promise<Student[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          classes:class_id (name)
        `);
      if (error) {
        console.error("Supabase error getting students:", error);
        throw new Error(error.message);
      }
      return (data || []).map((s: any) => ({
        ...s,
        class_name: s.classes?.name || ''
      }));
    }
    const students = getLocalItems<Student>('students');
    const classes = getLocalItems<Class>('classes');
    return students.map(s => {
      const c = classes.find(classObj => classObj.id === s.class_id);
      return { ...s, class_name: c ? c.name : '' };
    });
  },

  async getStudentById(id: string): Promise<Student | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          classes:class_id (name)
        `)
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error("Supabase error getting student:", error);
        throw new Error(error.message);
      }
      return {
        ...data,
        class_name: data.classes?.name || ''
      };
    }
    const students = await this.getStudents();
    return students.find(s => s.id === id) || null;
  },

  async addStudent(studentData: Omit<Student, 'id' | 'student_id' | 'madrasha_id'>): Promise<Student> {
    if (isSupabaseConfigured()) {
      const madrasha = await this.getMadrasha();
      
      // Auto-generate student code like MTQ-006 (by counting records in Supabase)
      const { count, error: countError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Supabase error counting students:", countError);
        throw new Error(countError.message);
      }

      const nextCodeNum = (count || 0) + 1;
      const student_id = `MTQ-${String(nextCodeNum).padStart(3, '0')}`;

      const { data, error } = await supabase
        .from('students')
        .insert([{
          ...studentData,
          student_id,
          madrasha_id: madrasha.id
        }])
        .select()
        .single();
      if (error) {
        console.error("Supabase error inserting student:", error);
        throw new Error(error.message);
      }
      return data;
    }

    const students = getLocalItems<Student>('students');
    const nextCodeNum = students.length + 1;
    const student_id = `MTQ-${String(nextCodeNum).padStart(3, '0')}`;
    const id = 'student-' + Date.now();
    const newStudent: Student = {
      ...studentData,
      id,
      student_id,
      madrasha_id: MOCK_MADRASHA_ID
    };

    students.push(newStudent);
    saveLocalItems('students', students);
    return newStudent;
  },

  async updateStudent(id: string, studentData: Partial<Student>): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', id);
      if (error) {
        console.error("Supabase error updating student:", error);
        throw new Error(error.message);
      }
      return;
    }
    const students = getLocalItems<Student>('students');
    const updated = students.map(s => s.id === id ? { ...s, ...studentData } as Student : s);
    saveLocalItems('students', updated);
  },

  async deleteStudent(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) {
        console.error("Supabase error deleting student:", error);
        throw new Error(error.message);
      }
      return;
    }
    const students = getLocalItems<Student>('students');
    saveLocalItems('students', students.filter(s => s.id !== id));
  },

  // Teacher Management
  async getTeachers(): Promise<Teacher[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          classes:class_id (name)
        `);
      if (error) {
        console.error("Supabase error getting teachers:", error);
        throw new Error(error.message);
      }
      return (data || []).map((t: any) => ({
        ...t,
        class_name: t.classes?.name || ''
      }));
    }
    const teachers = getLocalItems<Teacher>('teachers');
    const classes = getLocalItems<Class>('classes');
    return teachers.map(t => {
      const c = classes.find(classObj => classObj.id === t.class_id);
      return { ...t, class_name: c ? c.name : '' };
    });
  },

  async getTeacherById(id: string): Promise<Teacher | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          classes:class_id (name)
        `)
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error("Supabase error getting teacher profile:", error);
        throw new Error(error.message);
      }
      return {
        ...data,
        class_name: data.classes?.name || ''
      };
    }
    const teachers = await this.getTeachers();
    return teachers.find(t => t.id === id) || null;
  },

  async addTeacher(teacherData: Omit<Teacher, 'id' | 'madrasha_id'>): Promise<Teacher> {
    if (isSupabaseConfigured()) {
      const madrasha = await this.getMadrasha();
      const { data, error } = await supabase
        .from('teachers')
        .insert([{
          ...teacherData,
          madrasha_id: madrasha.id
        }])
        .select()
        .single();
      if (error) {
        console.error("Supabase error inserting teacher:", error);
        throw new Error(error.message);
      }
      return data;
    }

    const id = 'teacher-' + Date.now();
    const newTeacher: Teacher = {
      ...teacherData,
      id,
      madrasha_id: MOCK_MADRASHA_ID
    };
    const teachers = getLocalItems<Teacher>('teachers');
    teachers.push(newTeacher);
    saveLocalItems('teachers', teachers);
    return newTeacher;
  },

  async updateTeacher(id: string, teacherData: Partial<Teacher>): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('teachers')
        .update(teacherData)
        .eq('id', id);
      if (error) {
        console.error("Supabase error updating teacher:", error);
        throw new Error(error.message);
      }
      return;
    }
    const teachers = getLocalItems<Teacher>('teachers');
    const updated = teachers.map(t => t.id === id ? { ...t, ...teacherData } as Teacher : t);
    saveLocalItems('teachers', updated);
  },

  async deleteTeacher(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (error) {
        console.error("Supabase error deleting teacher:", error);
        throw new Error(error.message);
      }
      return;
    }
    const teachers = getLocalItems<Teacher>('teachers');
    saveLocalItems('teachers', teachers.filter(t => t.id !== id));
  },

  // Attendance Management
  async getAttendance(date: string, classId: string): Promise<Attendance[]> {
    if (isSupabaseConfigured()) {
      // First get student IDs for the specified class
      const { data: classStudents, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId);
      
      if (studentError) {
        console.error("Supabase error fetching students in class:", studentError);
        throw new Error(studentError.message);
      }

      const studentIds = (classStudents || []).map((s: any) => s.id);
      if (studentIds.length === 0) return [];

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', date)
        .in('student_id', studentIds);

      if (error) {
        console.error("Supabase error fetching attendance records:", error);
        throw new Error(error.message);
      }
      return data || [];
    }
    const attendances = getLocalItems<Attendance>('attendance');
    const students = getLocalItems<Student>('students').filter(s => s.class_id === classId);
    const studentIds = students.map(s => s.id);
    return attendances.filter(a => a.date === date && studentIds.includes(a.student_id));
  },

  async saveAttendance(date: string, records: { student_id: string; status: 'present' | 'absent' }[]): Promise<void> {
    if (isSupabaseConfigured()) {
      const madrashaId = (await this.getMadrasha()).id;
      for (const record of records) {
        const { error } = await supabase
          .from('attendance')
          .upsert({
            student_id: record.student_id,
            date,
            status: record.status,
            madrasha_id: madrashaId
          }, { onConflict: 'student_id,date' });
        if (error) {
          console.error("Supabase error upserting attendance:", error);
          throw new Error(error.message);
        }
      }
      return;
    }

    const attendances = getLocalItems<Attendance>('attendance');
    const studentIds = records.map(r => r.student_id);
    const remaining = attendances.filter(a => !(a.date === date && studentIds.includes(a.student_id)));

    records.forEach(r => {
      remaining.push({
        id: 'att-' + Date.now() + '-' + Math.random(),
        student_id: r.student_id,
        date,
        status: r.status,
        madrasha_id: MOCK_MADRASHA_ID
      });
    });

    saveLocalItems('attendance', remaining);
  },

  // Hifz Progress
  async getHifzProgress(studentId: string): Promise<HifzProgress[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('hifz_progress')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });
      if (error) {
        console.error("Supabase error fetching hifz progress:", error);
        throw new Error(error.message);
      }
      return data || [];
    }
    const hifz = getLocalItems<HifzProgress>('hifz_progress');
    return hifz
      .filter(h => h.student_id === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  async saveHifzProgress(progress: Omit<HifzProgress, 'id' | 'madrasha_id'>): Promise<HifzProgress> {
    if (isSupabaseConfigured()) {
      const madrasha = await this.getMadrasha();
      const { data, error } = await supabase
        .from('hifz_progress')
        .insert([{
          ...progress,
          madrasha_id: madrasha.id
        }])
        .select()
        .single();
      if (error) {
        console.error("Supabase error inserting hifz progress:", error);
        throw new Error(error.message);
      }
      return data;
    }

    const id = 'hifz-p-' + Date.now();
    const newProgress: HifzProgress = {
      ...progress,
      id,
      madrasha_id: MOCK_MADRASHA_ID
    };

    const allHifz = getLocalItems<HifzProgress>('hifz_progress');
    allHifz.push(newProgress);
    saveLocalItems('hifz_progress', allHifz);
    return newProgress;
  },

  // Fee Collection
  async getFees(): Promise<FeeCollection[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('fee_collection')
        .select('*');
      if (error) {
        console.error("Supabase error getting fees:", error);
        throw new Error(error.message);
      }
      return data || [];
    }
    return getLocalItems<FeeCollection>('fee_collection');
  },

  async collectFee(studentId: string, month: number, year: number, amount: number): Promise<FeeCollection> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const receipt_number = `REC-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;

    if (isSupabaseConfigured()) {
      const madrasha = await this.getMadrasha();
      const { data, error } = await supabase
        .from('fee_collection')
        .insert([{
          student_id: studentId,
          month,
          year,
          amount,
          receipt_number,
          paid_date: new Date().toISOString().slice(0, 10),
          madrasha_id: madrasha.id
        }])
        .select()
        .single();
      if (error) {
        console.error("Supabase error collecting fee:", error);
        throw new Error(error.message);
      }
      return data;
    }

    const id = 'fee-' + Date.now();
    const newFee: FeeCollection = {
      id,
      student_id: studentId,
      month,
      year,
      amount,
      paid_date: new Date().toISOString().slice(0, 10),
      receipt_number,
      madrasha_id: MOCK_MADRASHA_ID
    };

    const fees = getLocalItems<FeeCollection>('fee_collection');
    fees.push(newFee);
    saveLocalItems('fee_collection', fees);
    return newFee;
  },

  // Teacher Salary Payments
  async getSalaries(): Promise<TeacherSalary[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('teacher_salary')
        .select('*');
      if (error) {
        console.error("Supabase error getting salaries:", error);
        throw new Error(error.message);
      }
      return data || [];
    }
    return getLocalItems<TeacherSalary>('teacher_salary');
  },

  async paySalary(teacherId: string, month: number, year: number, amount: number): Promise<TeacherSalary> {
    if (isSupabaseConfigured()) {
      const madrasha = await this.getMadrasha();
      const { data, error } = await supabase
        .from('teacher_salary')
        .insert([{
          teacher_id: teacherId,
          month,
          year,
          amount,
          paid_date: new Date().toISOString().slice(0, 10),
          madrasha_id: madrasha.id
        }])
        .select()
        .single();
      if (error) {
        console.error("Supabase error paying salary:", error);
        throw new Error(error.message);
      }
      return data;
    }

    const id = 'sal-' + Date.now();
    const newSalary: TeacherSalary = {
      id,
      teacher_id: teacherId,
      month,
      year,
      amount,
      paid_date: new Date().toISOString().slice(0, 10),
      madrasha_id: MOCK_MADRASHA_ID
    };

    const salaries = getLocalItems<TeacherSalary>('teacher_salary');
    salaries.push(newSalary);
    saveLocalItems('teacher_salary', salaries);
    return newSalary;
  },

  // Committee Member management
  async getCommitteeMembers(): Promise<CommitteeMember[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('committee_members')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        console.error("Supabase error getting committee members:", error);
        throw new Error(error.message);
      }
      return data || [];
    }
    return getLocalItems<CommitteeMember>('committee_members');
  },

  async addCommitteeMember(memberData: Omit<CommitteeMember, 'id' | 'madrasha_id'>): Promise<CommitteeMember> {
    if (isSupabaseConfigured()) {
      const madrasha = await this.getMadrasha();
      const { data, error } = await supabase
        .from('committee_members')
        .insert([{
          ...memberData,
          madrasha_id: madrasha.id
        }])
        .select()
        .single();
      if (error) {
        console.error("Supabase error inserting committee member:", error);
        throw new Error(error.message);
      }
      return data;
    }

    const id = 'comm-' + Date.now();
    const newMember: CommitteeMember = {
      ...memberData,
      id,
      madrasha_id: MOCK_MADRASHA_ID
    };
    const members = getLocalItems<CommitteeMember>('committee_members');
    members.push(newMember);
    saveLocalItems('committee_members', members);
    return newMember;
  },

  async updateCommitteeMember(id: string, memberData: Partial<CommitteeMember>): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('committee_members')
        .update(memberData)
        .eq('id', id);
      if (error) {
        console.error("Supabase error updating committee member:", error);
        throw new Error(error.message);
      }
      return;
    }
    const members = getLocalItems<CommitteeMember>('committee_members');
    const updated = members.map(m => m.id === id ? { ...m, ...memberData } as CommitteeMember : m);
    saveLocalItems('committee_members', updated);
  },

  async deleteCommitteeMember(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('committee_members').delete().eq('id', id);
      if (error) {
        console.error("Supabase error deleting committee member:", error);
        throw new Error(error.message);
      }
      return;
    }
    const members = getLocalItems<CommitteeMember>('committee_members');
    saveLocalItems('committee_members', members.filter(m => m.id !== id));
  },

  // Expense management
  async getExpenses(): Promise<Expense[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*');
      if (error) {
        console.error("Supabase error getting expenses:", error);
        throw new Error(error.message);
      }
      return data || [];
    }
    return getLocalItems<Expense>('expenses');
  },

  async addExpense(title: string, amount: number, category: string, date: string): Promise<Expense> {
    if (isSupabaseConfigured()) {
      const madrasha = await this.getMadrasha();
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          title,
          amount,
          category,
          expense_date: date,
          madrasha_id: madrasha.id
        }])
        .select()
        .single();
      if (error) {
        console.error("Supabase error inserting expense:", error);
        throw new Error(error.message);
      }
      return data;
    }

    const id = 'exp-' + Date.now();
    const newExpense: Expense = {
      id,
      title,
      amount,
      category,
      expense_date: date,
      madrasha_id: MOCK_MADRASHA_ID
    };

    const expenses = getLocalItems<Expense>('expenses');
    expenses.push(newExpense);
    saveLocalItems('expenses', expenses);
    return newExpense;
  },

  async deleteExpense(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) {
        console.error("Supabase error deleting expense:", error);
        throw new Error(error.message);
      }
      return;
    }
    const expenses = getLocalItems<Expense>('expenses');
    saveLocalItems('expenses', expenses.filter(e => e.id !== id));
  },

  // Exams & Results
  async getExams(): Promise<Exam[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          classes:class_id (name)
        `);
      if (error) {
        console.error("Supabase error getting exams:", error);
        throw new Error(error.message);
      }
      return (data || []).map((e: any) => ({
        ...e,
        class_name: e.classes?.name || ''
      }));
    }
    const exams = getLocalItems<Exam>('exams');
    const classes = getLocalItems<Class>('classes');
    return exams.map(e => {
      const c = classes.find(classObj => classObj.id === e.class_id);
      return { ...e, class_name: c ? c.name : '' };
    });
  },

  async addExam(name: string, classId: string, examDate: string, totalMarks: number): Promise<Exam> {
    if (isSupabaseConfigured()) {
      const madrasha = await this.getMadrasha();
      const { data, error } = await supabase
        .from('exams')
        .insert([{
          name,
          class_id: classId,
          exam_date: examDate,
          total_marks: totalMarks,
          madrasha_id: madrasha.id
        }])
        .select()
        .single();
      if (error) {
        console.error("Supabase error inserting exam:", error);
        throw new Error(error.message);
      }
      return data;
    }

    const id = 'exam-' + Date.now();
    const newExam: Exam = {
      id,
      name,
      class_id: classId,
      exam_date: examDate,
      total_marks: totalMarks,
      madrasha_id: MOCK_MADRASHA_ID
    };

    const exams = getLocalItems<Exam>('exams');
    exams.push(newExam);
    saveLocalItems('exams', exams);
    return newExam;
  },

  async getResults(examId: string): Promise<Result[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          students:student_id (name, student_id)
        `)
        .eq('exam_id', examId);
      if (error) {
        console.error("Supabase error getting exam results:", error);
        throw new Error(error.message);
      }
      return (data || []).map((r: any) => ({
        ...r,
        student_name: r.students?.name || '',
        student_code: r.students?.student_id || ''
      }));
    }
    const results = getLocalItems<Result>('results');
    const students = getLocalItems<Student>('students');
    return results
      .filter(r => r.exam_id === examId)
      .map(r => {
        const s = students.find(stud => stud.id === r.student_id);
        return {
          ...r,
          student_name: s ? s.name : '',
          student_code: s ? s.student_id : ''
        };
      });
  },

  async saveResults(examId: string, records: { student_id: string; marks_obtained: number }[]): Promise<void> {
    if (isSupabaseConfigured()) {
      const madrashaId = (await this.getMadrasha()).id;
      for (const rec of records) {
        const { error } = await supabase
          .from('results')
          .upsert({
            exam_id: examId,
            student_id: rec.student_id,
            marks_obtained: rec.marks_obtained,
            madrasha_id: madrashaId
          }, { onConflict: 'exam_id,student_id' });
        if (error) {
          console.error("Supabase error upserting results:", error);
          throw new Error(error.message);
        }
      }
      return;
    }

    const results = getLocalItems<Result>('results');
    const studentIds = records.map(r => r.student_id);
    const remaining = results.filter(r => !(r.exam_id === examId && studentIds.includes(r.student_id)));

    records.forEach(r => {
      remaining.push({
        id: 'res-' + Date.now() + '-' + Math.random(),
        exam_id: examId,
        student_id: r.student_id,
        marks_obtained: r.marks_obtained,
        madrasha_id: MOCK_MADRASHA_ID
      });
    });

    saveLocalItems('results', remaining);
  }
};
