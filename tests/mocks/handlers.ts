/**
 * MSW (Mock Service Worker) handlers for StudyHub API endpoints.
 * Used in integration tests to intercept network requests without a live backend.
 */
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000/api';

// ─── Shared mock data ─────────────────────────────────────────────────────────
export const MOCK_USER = {
  id:         'user-001',
  name:       'Test Student',
  email:      'test@school.edu',
  role:       'student' as const,
  school_id:  'school-001',
  grade:      '10',
  school:     { id: 'school-001', name: 'Everest High School', city: 'Kathmandu', is_active: true },
  created_at: '2025-01-01T00:00:00Z',
};

export const MOCK_AUTH_RESPONSE = {
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock',
  user:         MOCK_USER,
};

export const MOCK_TOKEN_STATUS = {
  has_token:      true,
  status:         'active' as const,
  plan:           '1m' as const,
  expires_at:     '2027-01-01T00:00:00Z',
  days_remaining: 180,
  device_info:    { platform: 'android', first_seen_at: '2025-06-01T00:00:00Z' },
};

export const MOCK_NOTES_PAGE = {
  data: [
    {
      id:          'note-001',
      school_id:   'school-001',
      subject:     'Mathematics',
      chapter:     'Chapter 5',
      title:       'Integration Techniques',
      file_url:    'https://storage.studyhub.app/notes/note-001.pdf',
      uploaded_by: 'Teacher A',
      type:        'note' as const,
      upvotes:     42,
      created_at:  '2025-06-01T00:00:00Z',
      preview_only: false,
    },
    {
      id:          'note-002',
      school_id:   'school-001',
      subject:     'Physics',
      chapter:     'Chapter 3',
      title:       'Newton\'s Laws of Motion',
      file_url:    'https://storage.studyhub.app/notes/note-002.pdf',
      uploaded_by: 'Teacher B',
      type:        'topper_note' as const,
      upvotes:     89,
      created_at:  '2025-06-05T00:00:00Z',
      preview_only: true,
    },
  ],
  next_cursor: null,
  has_more:    false,
};

export const MOCK_HOMEWORK_PAGE = {
  data: [
    {
      id:          'hw-001',
      school_id:   'school-001',
      subject:     'Mathematics',
      title:       'Integration Problems Set A',
      description: 'Solve problems 1–20 from the integration worksheet.',
      due_at:      '2025-07-10T00:00:00Z',
      assigned_by: 'Teacher A',
      preview_only: false,
    },
  ],
  next_cursor: null,
  has_more:    false,
};

// ─── Handlers ─────────────────────────────────────────────────────────────────
export const handlers = [
  // Auth
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string };
    if (body?.email === 'test@school.edu' && body?.password === 'password123') {
      return HttpResponse.json(MOCK_AUTH_RESPONSE);
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.post(`${BASE}/auth/signup`, async () => {
    return HttpResponse.json(MOCK_AUTH_RESPONSE, { status: 201 });
  }),

  http.post(`${BASE}/auth/refresh`, () => {
    return HttpResponse.json({ access_token: MOCK_AUTH_RESPONSE.access_token });
  }),

  http.post(`${BASE}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Users
  http.get(`${BASE}/users/me`, () => {
    return HttpResponse.json(MOCK_USER);
  }),

  // Schools
  http.get(`${BASE}/schools`, () => {
    return HttpResponse.json([
      { id: 'school-001', name: 'Everest High School', city: 'Kathmandu', is_active: true },
      { id: 'school-002', name: 'Himalayan Academy',  city: 'Pokhara',   is_active: true },
    ]);
  }),

  // Notes
  http.get(`${BASE}/notes`, () => {
    return HttpResponse.json(MOCK_NOTES_PAGE);
  }),

  http.get(`${BASE}/notes/:id`, ({ params }) => {
    const note = MOCK_NOTES_PAGE.data.find((n) => n.id === params.id);
    if (!note) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(note);
  }),

  http.post(`${BASE}/notes/:id/bookmark`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Homework
  http.get(`${BASE}/homework`, () => {
    return HttpResponse.json(MOCK_HOMEWORK_PAGE);
  }),

  http.get(`${BASE}/homework/:id`, ({ params }) => {
    const hw = MOCK_HOMEWORK_PAGE.data.find((h) => h.id === params.id);
    if (!hw) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(hw);
  }),

  // Token
  http.get(`${BASE}/tokens/status`, () => {
    return HttpResponse.json(MOCK_TOKEN_STATUS);
  }),

  http.post(`${BASE}/tokens/activate`, () => {
    return HttpResponse.json(MOCK_TOKEN_STATUS);
  }),

  // Discussions
  http.get(`${BASE}/discussions`, () => {
    return HttpResponse.json({ data: [], next_cursor: null, has_more: false });
  }),

  // Search
  http.get(`${BASE}/search`, () => {
    return HttpResponse.json({ notes: [], homework: [], past_papers: [], discussions: [] });
  }),
];
