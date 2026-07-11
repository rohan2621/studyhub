/**
 * MSW Node server — used in Jest (Node environment).
 * Import this in test files to intercept real network calls.
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
