import { logger } from './logger';

type AnalyticsEvent =
  | 'login'
  | 'signup'
  | 'logout'
  | 'open_note'
  | 'download_note'
  | 'bookmark_note'
  | 'submit_homework'
  | 'create_discussion'
  | 'search'
  | 'activate_token'
  | 'renew_token_tap'
  | 'custom_request_submit'
  | 'open_homework_attachment'
  | 'device_mismatch_shown';

export const analytics = {
  track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
    logger.info(`[Analytics] ${event}`, properties);
    // In production, replace with your provider:
    // PostHog.capture(event, properties);
    // Mixpanel.track(event, properties);
  },
};
