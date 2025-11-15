// Update AI consent
export const updateAiConsent = (aiConsent) => API.patch('/users/ai-consent', { aiConsent });

import axios from "axios";

const API = axios.create({ baseURL: `${import.meta.env.VITE_BACKEND_URL}/api` });

// Attach token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signIn = (data) => API.post("/auth/signin", data);
export const signUp = (data) => API.post("/auth/signup", data);
export const getUser = () => API.get("/users/current");

// Groups
export const getGroups = () => API.get("/groups");
export const getGroup = (id) => API.get(`/groups/${id}`);
export const getGroupExpenses = (id) => API.get(`/groups/${id}/expenses`);
export const createGroup = (data) => API.post("/groups", data);
export const updateGroup = (id, data) => API.put(`/groups/${id}`, data);
export const deleteGroup = (id) => API.delete(`/groups/${id}`);

// Expenses
export const getExpenses = () => API.get("/expenses");
export const getExpense = (id) => API.get(`/expenses/${id}`);
export const createExpense = (data) => API.post("/expenses", data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// Settlements
export const getSettlements = () => API.get("/settlements");
export const createSettlement = (data) => API.post("/settlements", data);
export const updateSettlement = (id, data) => API.put(`/settlements/${id}`, data);
export const deleteSettlement = (id) => API.delete(`/settlements/${id}`);

// Settlement data helpers
export const getSettlementData = (entityType, entityId) =>
  API.get(`/settlements/data`, { params: { entityType, entityId } });

// Contacts
export const getContacts = () => API.get("/contacts");
export const createGroupViaContacts = (data) => API.post("/contacts/groups", data);

// Dashboard
export const getBalances = () => API.get("/dashboard/balances");

// Profile
export const changePassword = (data) => API.post("/users/change-password", data);
export const uploadProfilePic = (formData) => API.post("/users/profile-pic", formData, { headers: { "Content-Type": "multipart/form-data" } });

// Insights/Reminders Email APIs
export const sendInsightsEmailNow = () => API.post("/dashboard/send-insights");
export const sendRemindersEmailNow = () => API.post("/dashboard/send-reminders");

export default API;
