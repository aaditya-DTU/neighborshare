// All API calls go through here.
// Token is stored in localStorage under "ns_token".

const BASE = import.meta.env.VITE_API_URL || "/api";
// const BASE = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("ns_token");
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request("POST", "/auth/login", { email, password }),
  signup: (data) => request("POST", "/auth/signup", data),
  me: () => request("GET", "/auth/me"),

  // Items
  getItems: () => request("GET", "/items"),
  getMyItems: () => request("GET", "/items/mine"),
  getItem: (id) => request("GET", `/items/${id}`),
  createItem: (data) => request("POST", "/items", data),
  deleteItem: (id) => request("DELETE", `/items/${id}`),

  // Requests
  getRequests: () => request("GET", "/requests"),
  createRequest: (data) => request("POST", "/requests", data),
  approveRequest: (id) => request("PATCH", `/requests/${id}/approve`),
  rejectRequest: (id) => request("PATCH", `/requests/${id}/reject`),
  cancelRequest: (id) => request("PATCH", `/requests/${id}/cancel`),
  returnItem: (id) => request("PATCH", `/requests/${id}/return`),

  // Reviews
  getReviewsForUser: (userId) => request("GET", `/reviews/user/${userId}`),
  getReviewsForRequest: (requestId) => request("GET", `/reviews/request/${requestId}`),
  submitReview: (data) => request("POST", "/reviews", data),

  // Notifications
  getNotifications: () => request("GET", "/notifications"),
  markNotificationsRead: () => request("PATCH", "/notifications/read-all"),

  // Messages
  getMessages: (requestId) => request("GET", `/messages/${requestId}`),
  sendMessage: (requestId, text) => request("POST", `/messages/${requestId}`, { text }),
  getUnreadCount: (requestId) => request("GET", `/messages/${requestId}/unread`),
};
