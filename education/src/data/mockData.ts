export interface Group {
  id: string;
  name: string;
  course: string;
  teacherName: string;
  room: string;
  days: string;
  time: string;
  studentsCount: number;
  monthlyFee: number;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  groupName: string;
  course: string;
  balance: number; // positive = overpaid/credit, negative = debt
  attendanceRate: number; // percentage
  status: 'active' | 'frozen';
  password?: string;
  xp: number;
  coins: number;
  joinedDate: string;
}

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  subject: string;
  groupsCount: number;
  studentsCount: number;
  salaryType: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  studentName: string;
  groupName: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer';
  date: string;
  recordedBy: string;
}

export interface Homework {
  id: string;
  title: string;
  groupName: string;
  teacherName: string;
  dueDate: string;
  submittedCount: number;
  totalStudents: number;
  status: 'active' | 'graded';
}

export interface Exam {
  id: string;
  title: string;
  groupName: string;
  date: string;
  room: string;
  maxScore: number;
  averageScore?: number;
}

export interface TimetableEntry {
  id: string;
  time: string;
  subject: string;
  groupName: string;
  teacher: string;
  room: string;
  days: string[];
}

export const mockGroups: Group[] = [
  {
    id: 'grp-1',
    name: 'IELTS Intensive 7.5',
    course: 'Ingliz tili (IELTS)',
    teacherName: 'Temur Aliyev',
    room: 'Xona 102 (Audio)',
    days: 'Du - Chor - Juma',
    time: '14:00 - 16:00',
    studentsCount: 16,
    monthlyFee: 750000,
  },
  {
    id: 'grp-2',
    name: 'Python Backend (Django)',
    course: 'Dasturlash',
    teacherName: 'Javohir Toshmatov',
    room: 'Kompyuter Lab 1',
    days: 'Se - Pay - Shan',
    time: '18:30 - 20:30',
    studentsCount: 14,
    monthlyFee: 850000,
  },
  {
    id: 'grp-3',
    name: 'General English B2',
    course: 'Ingliz tili',
    teacherName: 'Zilola Karimova',
    room: 'Xona 105',
    days: 'Du - Chor - Juma',
    time: '10:00 - 12:00',
    studentsCount: 18,
    monthlyFee: 600000,
  },
  {
    id: 'grp-4',
    name: 'Matematika Pre-University',
    course: 'Aniq fanlar',
    teacherName: 'Bobur Yoqubov',
    room: 'Xona 201',
    days: 'Se - Pay - Shan',
    time: '16:00 - 18:00',
    studentsCount: 15,
    monthlyFee: 550000,
  },
];

export const mockStudents: Student[] = [
  {
    id: 'std-1',
    name: 'Abdurashid Valiyev',
    phone: '+998 90 123 45 67',
    groupName: 'IELTS Intensive 7.5',
    course: 'Ingliz tili',
    balance: -250000, // Qarzdor
    attendanceRate: 94,
    status: 'active',
    xp: 1450,
    coins: 85,
    joinedDate: '2026-09-01',
  },
  {
    id: 'std-2',
    name: 'Madina Ismoilova',
    phone: '+998 93 987 65 43',
    groupName: 'Python Backend (Django)',
    course: 'Dasturlash',
    balance: 0,
    attendanceRate: 98,
    status: 'active',
    xp: 1820,
    coins: 120,
    joinedDate: '2026-09-10',
  },
  {
    id: 'std-3',
    name: 'Sarvar Qosimov',
    phone: '+998 91 333 44 55',
    groupName: 'IELTS Intensive 7.5',
    course: 'Ingliz tili',
    balance: -750000, // To'liq oylik qarzdor
    attendanceRate: 82,
    status: 'active',
    xp: 950,
    coins: 40,
    joinedDate: '2026-08-15',
  },
  {
    id: 'std-4',
    name: 'Jasur Bekmurodov',
    phone: '+998 97 555 11 22',
    groupName: 'General English B2',
    course: 'Ingliz tili',
    balance: 100000, // Oldindan to'lagan
    attendanceRate: 100,
    status: 'active',
    xp: 1640,
    coins: 95,
    joinedDate: '2026-09-05',
  },
  {
    id: 'std-5',
    name: 'Shaxnoza Rahimova',
    phone: '+998 94 444 88 99',
    groupName: 'Matematika Pre-University',
    course: 'Aniq fanlar',
    balance: -150000,
    attendanceRate: 91,
    status: 'active',
    xp: 1200,
    coins: 70,
    joinedDate: '2026-09-12',
  },
  {
    id: 'std-6',
    name: 'Diyorbek Mahmudov',
    phone: '+998 99 777 33 22',
    groupName: 'Python Backend (Django)',
    course: 'Dasturlash',
    balance: 0,
    attendanceRate: 95,
    status: 'active',
    xp: 1530,
    coins: 110,
    joinedDate: '2026-09-02',
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: 'tch-1',
    name: 'Temur Aliyev',
    phone: '+998 90 999 00 11',
    subject: 'IELTS & Academic English',
    groupsCount: 3,
    studentsCount: 48,
    salaryType: 'KPI + Soatbay',
  },
  {
    id: 'tch-2',
    name: 'Javohir Toshmatov',
    phone: '+998 91 888 22 33',
    subject: 'Python / Django Backend',
    groupsCount: 2,
    studentsCount: 28,
    salaryType: 'Ulush (50/50)',
  },
  {
    id: 'tch-3',
    name: 'Zilola Karimova',
    phone: '+998 93 777 44 55',
    subject: 'General English (CEFR)',
    groupsCount: 4,
    studentsCount: 65,
    salaryType: 'Oylik fiksirlangan',
  },
  {
    id: 'tch-4',
    name: 'Bobur Yoqubov',
    phone: '+998 97 666 33 44',
    subject: 'Oliy matematika & Fizika',
    groupsCount: 2,
    studentsCount: 30,
    salaryType: "O'quvchi boshiga foiz",
  },
];

export const mockPayments: PaymentReceipt[] = [
  {
    id: 'pay-1',
    receiptNumber: 'RCP-2026-0891',
    studentName: 'Madina Ismoilova',
    groupName: 'Python Backend (Django)',
    amount: 850000,
    method: 'card',
    date: '2026-10-14 16:45',
    recordedBy: 'Aziza Admin (Yordamchi admin)',
  },
  {
    id: 'pay-2',
    receiptNumber: 'RCP-2026-0890',
    studentName: 'Jasur Bekmurodov',
    groupName: 'General English B2',
    amount: 700000,
    method: 'cash',
    date: '2026-10-14 11:20',
    recordedBy: 'Aziza Admin (Yordamchi admin)',
  },
  {
    id: 'pay-3',
    receiptNumber: 'RCP-2026-0889',
    studentName: 'Abdurashid Valiyev',
    groupName: 'IELTS Intensive 7.5',
    amount: 500000,
    method: 'transfer',
    date: '2026-10-13 14:10',
    recordedBy: 'Sanjar Rahimov (Boshliq)',
  },
];

export const mockHomeworks: Homework[] = [
  {
    id: 'hw-1',
    title: 'Writing Task 2: Opinion Essay on AI in Education',
    groupName: 'IELTS Intensive 7.5',
    teacherName: 'Temur Aliyev',
    dueDate: '2026-10-18',
    submittedCount: 12,
    totalStudents: 16,
    status: 'active',
  },
  {
    id: 'hw-2',
    title: 'DRF Serializers & Custom Validations Practice',
    groupName: 'Python Backend (Django)',
    teacherName: 'Javohir Toshmatov',
    dueDate: '2026-10-17',
    submittedCount: 10,
    totalStudents: 14,
    status: 'active',
  },
  {
    id: 'hw-3',
    title: 'Past Perfect Continuous vs Past Perfect Simple',
    groupName: 'General English B2',
    teacherName: 'Zilola Karimova',
    dueDate: '2026-10-15',
    submittedCount: 18,
    totalStudents: 18,
    status: 'graded',
  },
];

export const mockExams: Exam[] = [
  {
    id: 'ex-1',
    title: 'IELTS Mock Exam (Full test: L/R/W/S)',
    groupName: 'IELTS Intensive 7.5',
    date: '2026-10-22 09:00',
    room: 'Katta Majlislar zali',
    maxScore: 9.0,
    averageScore: 6.8,
  },
  {
    id: 'ex-2',
    title: 'Django REST Framework Mid-Term Project Defense',
    groupName: 'Python Backend (Django)',
    date: '2026-10-25 18:30',
    room: 'Lab 1',
    maxScore: 100,
  },
];

export const mockTimetable: TimetableEntry[] = [
  {
    id: 'tt-1',
    time: '10:00 - 12:00',
    subject: 'General English B2',
    groupName: 'General English B2',
    teacher: 'Zilola Karimova',
    room: 'Xona 105',
    days: ['Dushanba', 'Chorshanba', 'Juma'],
  },
  {
    id: 'tt-2',
    time: '14:00 - 16:00',
    subject: 'IELTS Intensive 7.5',
    groupName: 'IELTS Intensive 7.5',
    teacher: 'Temur Aliyev',
    room: 'Xona 102 (Audio)',
    days: ['Dushanba', 'Chorshanba', 'Juma'],
  },
  {
    id: 'tt-3',
    time: '16:00 - 18:00',
    subject: 'Matematika Pre-University',
    groupName: 'Matematika Pre-University',
    teacher: 'Bobur Yoqubov',
    room: 'Xona 201',
    days: ['Seshanba', 'Payshanba', 'Shanba'],
  },
  {
    id: 'tt-4',
    time: '18:30 - 20:30',
    subject: 'Python Backend (Django)',
    groupName: 'Python Backend (Django)',
    teacher: 'Javohir Toshmatov',
    room: 'Kompyuter Lab 1',
    days: ['Seshanba', 'Payshanba', 'Shanba'],
  },
];
