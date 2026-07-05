export interface School {
  id: string;
  name: string;
  city: string;
  logo_url: string;
  is_active: boolean;
}

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  school_id?: string;
  schoolId?: string;
  school_name?: string;
  school?: string;
  grade: number | string;
  section?: string;
  created_at?: string;
  createdAt?: string;
}

export type TokenPlan = "1m" | "3m" | "6m" | "1y";
export type TokenStatus = "unused" | "active" | "expired" | "revoked";

export interface Token {
  id: string;
  code: string;
  user_id: string;
  plan: TokenPlan;
  issued_at: string;
  expires_at: string;
  status: TokenStatus;
  device_id: string | null;
  is_device_permanent?: boolean;
  can_bind_permanent?: boolean;
}

export interface Device {
  id: string;
  user_id: string;
  device_fingerprint: string;
  platform: "web" | "ios" | "android";
  first_seen_at: string;
  last_seen_at: string;
}

export type NoteType = "note" | "topper_note";

export interface Note {
  id: string;
  school_id: string;
  subject: string;
  chapter: string;
  title: string;
  file_url: string;
  uploaded_by: string;
  type: NoteType;
  upvotes: number;
  created_at: string;
}

export interface Homework {
  id: string;
  school_id: string;
  subject: string;
  title: string;
  description: string;
  due_at: string;
  assigned_by: string;
  attachment_url: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  homework_id: string;
  student_id: string;
  file_url: string;
  submitted_at: string;
  grade: string | null;
}

export interface PastPaper {
  id: string;
  school_id: string;
  subject: string;
  year: number;
  term: string;
  file_url: string;
  created_at: string;
}

export interface TimetableSlot {
  id: string;
  school_id: string;
  grade: number;
  day: string;
  period: number;
  subject: string;
  start_time: string;
  end_time: string;
}

export interface DiscussionThread {
  id: string;
  school_id: string;
  subject: string;
  title: string;
  author_id: string;
  author_name: string;
  reply_count: number;
  created_at: string;
}

export interface DiscussionReply {
  id: string;
  thread_id: string;
  body: string;
  author_id: string;
  author_name: string;
  created_at: string;
}

export type CustomRequestType = "note" | "homework" | "pyq" | "topper_note";
export type CustomRequestStatus = "pending" | "fulfilled" | "closed";

export interface CustomRequest {
  id: string;
  user_id: string;
  type: CustomRequestType;
  subject: string;
  chapter: string;
  note: string;
  status: CustomRequestStatus;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  plan: TokenPlan;
  amount: number;
  channel: string;
  recorded_by_admin: string;
  token_id: string;
  created_at: string;
}

export interface DashboardFeed {
  upcoming_homework: Homework[];
  trending_notes: Note[];
  recent_uploads: (Note | PastPaper | Homework)[];
}

export interface AuthState {
  user: User | null;
  token: Token | null;
  deviceId: string | null;
  isLoading: boolean;
}

export type TokenUIState =
  | "no-user"
  | "logged-out"
  | "preview"
  | "active"
  | "expired"
  | "device-mismatch";
