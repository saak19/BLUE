const ROLES = {
  HOST: 'host',
  VISITOR: 'visitor'
};

const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
};

const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

const PRESENCE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};

const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  STATUS_UPDATE: 'status_update',
  NEW_REQUEST: 'new_request',
  REQUEST_UPDATED: 'request_updated'
};

const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME_PROFILE: '/api/profiles/me',
  PUBLIC_HOST: (hostId) => `/api/public/hosts/${hostId}`,
  AVAILABILITY: '/api/availability',
  BOOKINGS: '/api/bookings',
  REQUESTS: '/api/requests'
};

module.exports = {
  ROLES,
  REQUEST_STATUS,
  BOOKING_STATUS,
  PRESENCE_STATUS,
  WS_EVENTS,
  API_ENDPOINTS
};
