/**
 * Jest global setup — runs before every test suite.
 * Starts the MSW server and ensures global fetch is available.
 */
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
