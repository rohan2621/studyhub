import type {
  School,
  User,
  Token,
  Note,
  Homework,
  PastPaper,
  TimetableSlot,
  DiscussionThread,
  CustomRequest,
} from "./api-types";

export const mockSchools: School[] = [
  { id: "s1", name: "Lincoln High School", city: "Springfield", logo_url: "", is_active: true },
  { id: "s2", name: "Riverside Academy", city: "Riverside", logo_url: "", is_active: true },
  { id: "s3", name: "Central Valley School", city: "Central Valley", logo_url: "", is_active: true },
  { id: "s4", name: "Northwood Prep", city: "Northwood", logo_url: "", is_active: true },
];

export const mockUser: User = {
  id: "u1",
  name: "Alex Johnson",
  email: "alex@lincoln.edu",
  role: "student",
  school_id: "s1",
  grade: 11,
  created_at: "2025-08-15T10:00:00Z",
};

export const mockTokenActive: Token = {
  id: "t1",
  code: "SH-7G2K-PLM4",
  user_id: "u1",
  plan: "3m",
  issued_at: "2025-09-01T08:00:00Z",
  expires_at: "2025-12-01T08:00:00Z",
  status: "active",
  device_id: "d1",
};

export const mockNotes: Note[] = [];

export const mockHomework: Homework[] = [];

export const mockPastPapers: PastPaper[] = [];

export const mockTimetable: TimetableSlot[] = [];

export const mockDiscussions: DiscussionThread[] = [];

export const mockCustomRequests: CustomRequest[] = [];
