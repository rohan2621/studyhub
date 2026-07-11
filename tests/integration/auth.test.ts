/**
 * Integration tests for the Auth flow using axios-mock-adapter.
 * Tests the full authApi contract without a live server.
 */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { authApi } from '../../src/api/auth';
import { apiClient } from '../../src/api/client';
import {
  MOCK_AUTH_RESPONSE,
  MOCK_USER,
} from '../mocks/handlers';

const mock = new MockAdapter(apiClient, { delayResponse: 0 });

beforeEach(() => {
  mock.reset();
});

afterAll(() => {
  mock.restore();
});

// ─── authApi.login() ──────────────────────────────────────────────────────────
describe('authApi.login()', () => {
  it('returns access_token and user on valid credentials', async () => {
    mock.onPost('/auth/login').reply(200, MOCK_AUTH_RESPONSE);

    const result = await authApi.login({
      email:    'test@school.edu',
      password: 'password123',
    });

    expect(result.access_token).toBe(MOCK_AUTH_RESPONSE.access_token);
    expect(result.user.id).toBe(MOCK_USER.id);
    expect(result.user.email).toBe('test@school.edu');
  });

  it('throws on invalid credentials (401)', async () => {
    mock.onPost('/auth/login').reply(401, { message: 'Invalid credentials' });

    await expect(
      authApi.login({ email: 'wrong@school.edu', password: 'bad' })
    ).rejects.toBeDefined();
  });

  it('throws on server error (500)', async () => {
    mock.onPost('/auth/login').reply(500, { message: 'Internal server error' });

    await expect(
      authApi.login({ email: 'test@school.edu', password: 'password123' })
    ).rejects.toBeDefined();
  });
});

// ─── authApi.signup() ─────────────────────────────────────────────────────────
describe('authApi.signup()', () => {
  it('creates account and returns access_token + user', async () => {
    mock.onPost('/auth/signup').reply(201, MOCK_AUTH_RESPONSE);

    const result = await authApi.signup({
      name:      'New Student',
      email:     'new@school.edu',
      password:  'securePass!1',
      school_id: 'school-001',
      grade:     '11',
      role:      'student',
    });

    expect(result.access_token).toBeTruthy();
    expect(result.user).toBeDefined();
  });
});

// ─── authApi.me() ─────────────────────────────────────────────────────────────
describe('authApi.me()', () => {
  it('returns the current user', async () => {
    mock.onGet('/users/me').reply(200, MOCK_USER);

    const user = await authApi.me();
    expect(user.id).toBe(MOCK_USER.id);
    expect(user.role).toBe('student');
    expect(user.school_id).toBe('school-001');
  });
});

// ─── authApi.logout() ────────────────────────────────────────────────────────
describe('authApi.logout()', () => {
  it('resolves cleanly', async () => {
    mock.onPost('/auth/logout').reply(204);
    await expect(authApi.logout()).resolves.toBeUndefined();
  });
});

// ─── authApi.schools() ───────────────────────────────────────────────────────
describe('authApi.schools()', () => {
  const MOCK_SCHOOLS = [
    { id: 'school-001', name: 'Everest High School', city: 'Kathmandu', is_active: true },
    { id: 'school-002', name: 'Himalayan Academy',  city: 'Pokhara',   is_active: true },
  ];

  it('returns a list of schools', async () => {
    mock.onGet('/schools').reply(200, MOCK_SCHOOLS);

    const schools = await authApi.schools();
    expect(Array.isArray(schools)).toBe(true);
    expect(schools.length).toBeGreaterThan(0);
    expect(schools[0]).toHaveProperty('name');
    expect(schools[0]).toHaveProperty('city');
  });

  it('filters schools by query param', async () => {
    mock.onGet('/schools', { params: { query: 'Everest' } }).reply(200, [MOCK_SCHOOLS[0]]);

    const schools = await authApi.schools('Everest');
    expect(Array.isArray(schools)).toBe(true);
  });
});

// ─── authApi.refresh() ───────────────────────────────────────────────────────
describe('authApi.refresh()', () => {
  it('returns a new access_token', async () => {
    mock.onPost('/auth/refresh').reply(200, { access_token: 'new-mock-token-xyz' });

    const result = await authApi.refresh();
    expect(result.access_token).toBeTruthy();
    expect(typeof result.access_token).toBe('string');
    expect(result.access_token).toBe('new-mock-token-xyz');
  });
});
