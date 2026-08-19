export const appConfig = {
  name: 'DevOps Resource Management Platform',
  version: '0.1.0',
  tagline: 'Control Infrastructure With Telemetry',
  auth: {
    tokenCookieName: 'token',
    tokenExpiryDays: 7,
  },
  pagination: {
    defaultPageSize: 10,
  },
  charts: {
    telemetryRefreshMs: 30000,
  },
} as const;
