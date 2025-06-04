import React, { createContext, useState, useEffect, ReactNode } from "react";

interface AuthState {
  hasAccess: boolean;
  roles: string[];
  userName: string;
}

interface AuthContextProps extends AuthState {
  setAuth: (auth: AuthState) => void;
}

const STORAGE_KEY = "perrot-auth";

export const AuthContext = createContext<AuthContextProps>({
  hasAccess: false,
  roles: [],
  userName: "",
  setAuth: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicializa el estado leyendo de localStorage
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored
        ? JSON.parse(stored)
        : { hasAccess: false, roles: [], userName: "" };
    } catch {
      return { hasAccess: false, roles: [], userName: "" };
    }
  });

  // Persiste en localStorage cada vez que cambia auth
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } catch {
      // Ignorar errores de storage
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
