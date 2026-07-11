// ─── Schools ──────────────────────────────────────────────────────────────────
export interface School {
  id:        string;
  name:      string;
  city:      string;
  logo_url?: string;
  is_active: boolean;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id:         string;
  name:       string;
  email:      string;
  role:       UserRole;
  school_id:  string;
  school?:    School;
  grade:      string;
  created_at: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  access_token: string;
  user:         User;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface SignupPayload {
  name:      string;
  email:     string;
  password:  string;
  school_id: string;
  grade:     string;
  role:      'student';
}

// ─── Tokens (license) ─────────────────────────────────────────────────────────
export type TokenPlan   = '1m' | '3m' | '6m' | '1y';
export type TokenStatus = 'unused' | 'active' | 'expired' | 'revoked';

export interface AccessToken {
  id:          string;
  code:        string;
  user_id:     string;
  plan:        TokenPlan;
  issued_at:   string;
  expires_at:  string | null;
  status:      TokenStatus;
  device_id?:  string;
}

export interface TokenStatusResponse {
  has_token:     boolean;
  status:        TokenStatus | null;
  plan:          TokenPlan | null;
  expires_at:    string | null;
  days_remaining:number | null;
  device_info?:  { platform: string; first_seen_at: string };
}

// ─── Notes ────────────────────────────────────────────────────────────────────
export type NoteType = 'note' | 'topper_note';

export interface Note {
  id:          string;
  school_id:   string;
  subject:     string;
  chapter:     string;
  title:       string;
  file_url:    string;
  uploaded_by: string;
  type:        NoteType;
  upvotes:     number;
  created_at:  string;
  preview_only?:boolean;
}

// ─── Homework ─────────────────────────────────────────────────────────────────
export interface Homework {
  id:             string;
  school_id:      string;
  subject:        string;
  title:          string;
  description:    string;
  due_at:         string;
  assigned_by:    string;
  attachment_url?:string;
  preview_only?:  boolean;
}

export interface Submission {
  id:           string;
  homework_id:  string;
  student_id:   string;
  file_url:     string;
  submitted_at: string;
  grade?:       string;
}

// ─── Past Papers ──────────────────────────────────────────────────────────────
export interface PastPaper {
  id:          string;
  school_id:   string;
  subject:     string;
  year:        number;
  term:        string;
  file_url:    string;
  preview_only?:boolean;
}

// ─── Discussions ──────────────────────────────────────────────────────────────
export interface DiscussionThread {
  id:         string;
  school_id:  string;
  subject:    string;
  title:      string;
  body:       string;
  author_id:  string;
  author?:    Pick<User, 'id' | 'name'>;
  created_at: string;
  reply_count:number;
  is_pinned?: boolean;
}

export interface DiscussionReply {
  id:         string;
  thread_id:  string;
  body:       string;
  author_id:  string;
  author?:    Pick<User, 'id' | 'name'>;
  created_at: string;
}

// ─── Timetable ────────────────────────────────────────────────────────────────
export interface TimetableSlot {
  id:         string;
  school_id:  string;
  grade:      string;
  day:        string;
  period:     number;
  subject:    string;
  start_time: string;
  end_time:   string;
}

// ─── Custom Requests ──────────────────────────────────────────────────────────
export type CustomRequestType    = 'note' | 'homework' | 'pyq' | 'topper_note';
export type CustomRequestStatus  = 'pending' | 'fulfilled' | 'closed';

export interface CustomRequest {
  id:      string;
  user_id: string;
  type:    CustomRequestType;
  subject: string;
  chapter: string;
  note:    string;
  status:  CustomRequestStatus;
}

// ─── Feed / Dashboard ─────────────────────────────────────────────────────────
export interface FeedResponse {
  upcoming_homework: Homework[];
  trending_notes:    Note[];
  recent_uploads:    Array<Note | PastPaper>;
  continue_studying?: Note | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data:        T[];
  next_cursor: string | null;
  has_more:    boolean;
}

// ─── Search ───────────────────────────────────────────────────────────────────
export interface SearchResult {
  notes:       Note[];
  homework:    Homework[];
  past_papers: PastPaper[];
  discussions: DiscussionThread[];
}
