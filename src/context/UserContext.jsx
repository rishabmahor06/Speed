import React, { createContext, useState } from "react";

export const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try to get user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }
    return null; // Return null if no user data found
  });

  // wrapper to keep localStorage in sync when user changes
  const setUserAndPersist = (newUser) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("Failed to persist user to localStorage:", err);
    }
  };

  return (
    <UserDataContext.Provider value={{ user, setUser: setUserAndPersist }}>
      {children}
    </UserDataContext.Provider>
  );
};
