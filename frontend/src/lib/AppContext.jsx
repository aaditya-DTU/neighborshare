import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "./api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); // checking saved token on mount

  // On mount: restore session from saved token
  useEffect(() => {
    const token = localStorage.getItem("ns_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setCurrentUser(user))
      .catch(() => localStorage.removeItem("ns_token"))
      .finally(() => setLoading(false));
  }, []);

  // Fetch shared data whenever user logs in
  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      setRequests([]);
      setNotifications([]);
      return;
    }
    refreshItems();
    refreshRequests();
    refreshNotifications();
  }, [currentUser?._id]);

  // ---- DATA REFRESHERS ----
  const refreshItems = useCallback(async () => {
    try {
      const data = await api.getItems();
      setItems(data);
    } catch (err) {
      console.error("refreshItems:", err.message);
    }
  }, []);

  const refreshRequests = useCallback(async () => {
    try {
      const data = await api.getRequests();
      setRequests(data);
    } catch (err) {
      console.error("refreshRequests:", err.message);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("refreshNotifications:", err.message);
    }
  }, []);

  // ---- AUTH ----
  const login = async (email, password) => {
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem("ns_token", token);
      setCurrentUser(user);
      return null; // no error
    } catch (err) {
      return err.message;
    }
  };

  const signup = async ({ name, email, password, label, lat, lng }) => {
    try {
      const { token, user } = await api.signup({ name, email, password, label, lat, lng });
      localStorage.setItem("ns_token", token);
      setCurrentUser(user);
      return null;
    } catch (err) {
      return err.message;
    }
  };

  const logout = () => {
    localStorage.removeItem("ns_token");
    setCurrentUser(null);
  };

  // ---- ITEMS ----
  const createItem = async (data) => {
    try {
      const item = await api.createItem({
        ...data,
        location: currentUser.location,
      });
      setItems((prev) => [item, ...prev]);
    } catch (err) {
      console.error("createItem:", err.message);
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.deleteItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error("deleteItem:", err.message);
    }
  };

  // ---- REQUESTS ----
  const createRequest = async (itemId, message, durationDays) => {
    try {
      const req = await api.createRequest({ itemId, message, durationDays });
      setRequests((prev) => [req, ...prev]);
      // mark item unavailable locally so UI updates immediately
      setItems((prev) =>
        prev.map((i) => (i._id === itemId ? { ...i, available: false } : i))
      );
      return null;
    } catch (err) {
      return err.message;
    }
  };

  const approveRequest = async (id) => {
    try {
      const updated = await api.approveRequest(id);
      setRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setItems((prev) =>
        prev.map((i) =>
          i._id === updated.itemId?._id ? { ...i, available: false } : i
        )
      );
      await refreshNotifications();
    } catch (err) {
      console.error("approveRequest:", err.message);
    }
  };

  const rejectRequest = async (id) => {
    try {
      const updated = await api.rejectRequest(id);
      setRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));
      await refreshNotifications();
    } catch (err) {
      console.error("rejectRequest:", err.message);
    }
  };

  const cancelRequest = async (id) => {
    try {
      const updated = await api.cancelRequest(id);
      setRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch (err) {
      console.error("cancelRequest:", err.message);
    }
  };

  const returnItem = async (id) => {
    try {
      const updated = await api.returnItem(id);
      setRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setItems((prev) =>
        prev.map((i) =>
          i._id === updated.itemId?._id ? { ...i, available: true } : i
        )
      );
      await refreshNotifications();
    } catch (err) {
      console.error("returnItem:", err.message);
    }
  };

  // ---- REVIEWS ----
  const submitReview = async (requestId, rating, comment) => {
    try {
      await api.submitReview({ requestId, rating, comment });
      // Refresh requests so the review badge shows up
      await refreshRequests();
      await refreshNotifications();
      // Refresh current user so trust score updates on profile
      const { user } = await api.me();
      setCurrentUser(user);
    } catch (err) {
      console.error("submitReview:", err.message);
    }
  };

  // ---- NOTIFICATIONS ----
  const markNotificationsRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("markNotificationsRead:", err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    currentUser,
    items,
    requests,
    notifications,
    unreadCount,
    loading,
    login,
    signup,
    logout,
    createItem,
    deleteItem,
    createRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
    returnItem,
    submitReview,
    markNotificationsRead,
    refreshItems,
    refreshRequests,
    refreshNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
