import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const UserSessionContext = createContext();

const TOKEN_STORAGE_KEY = "jwtToken";
const USER_STORAGE_KEY = "user";


function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export const UserSessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return false;
    return Date.now() < payload.exp * 1000;
  }, []);

  const isValidUserData = useCallback((data) => {
    return (
      data &&
      (
        (typeof data.email === "string" && data.email.length > 0) ||
        (typeof data.username === "string" && data.username.length > 0)
      )
    );
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const userDataRaw = localStorage.getItem(USER_STORAGE_KEY);

    if (token && isTokenValid(token) && userDataRaw) {
      try {
        const parsedUser = JSON.parse(userDataRaw);
        if (isValidUserData(parsedUser)) {
          setUser(parsedUser);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setLoading(false);
  }, [isTokenValid, isValidUserData]);

  // Polling logout on token expiry every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && !isTokenValid(token)) {
        logout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isTokenValid]);

  const login = (userData, token) => {
    if (!isValidUserData(userData)) throw new Error("Invalid user data");
    if (!isTokenValid(token)) throw new Error("Invalid or expired token");

    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  // Synchronize logout/login across tabs
  useEffect(() => {
    const syncSession = (event) => {
      if (
        event.key === TOKEN_STORAGE_KEY ||
        event.key === USER_STORAGE_KEY
      ) {
        const newToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const newUserDataRaw = localStorage.getItem(USER_STORAGE_KEY);

        if (!newToken || !newUserDataRaw) {
          setUser(null);
        } else {
          try {
            const newUser = JSON.parse(newUserDataRaw);
            if (isValidUserData(newUser) && isTokenValid(newToken)) {
              setUser(newUser);
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        }
      }
    };

    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, [isTokenValid, isValidUserData]);

  const isUserLoggedIn = !!user;

  return (
    <UserSessionContext.Provider
      value={{ user, isUserLoggedIn, login, logout, loading }}
    >
      {children}
    </UserSessionContext.Provider>
  );
};

export const useUserSession = () => useContext(UserSessionContext);
