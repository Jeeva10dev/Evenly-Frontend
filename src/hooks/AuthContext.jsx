import React from "react";

const AuthContext = React.createContext({
  isAuthenticated: false,
  user: null,
  login: (_token, _user) => {},
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const syncAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/current`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            const normalizedUser = {
              ...userData,
              id: userData.id || userData._id,
              _id: userData._id || userData.id,
            };
            setIsAuthenticated(true);
            setUser(normalizedUser);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          const parsedUser = JSON.parse(storedUser);
          const normalizedUser = {
            ...parsedUser,
            id: parsedUser.id || parsedUser._id,
            _id: parsedUser._id || parsedUser.id,
          };
          setIsAuthenticated(true);
          setUser(normalizedUser);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };
    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    if (userData) {
      const normalizedUser = {
        ...userData,
        id: userData.id || userData._id,
        _id: userData._id || userData.id,
      };
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = React.useMemo(
    () => ({ isAuthenticated, user, login, logout, loading }),
    [isAuthenticated, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return React.useContext(AuthContext);
}