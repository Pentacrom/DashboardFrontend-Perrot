// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";

export interface UserAccount {
  username: string;
  password: string;
  roles: string[];
  userName: string;
}

export interface AuthState {
  hasAccess: boolean;
  roles: string[];
  userName: string;
}

export interface AuthContextProps extends AuthState {
  setAuth: (auth: AuthState) => void;
  users: UserAccount[];
  addUser: (u: UserAccount) => void;
  updateUser: (idx: number, u: UserAccount) => void;
  deleteUser: (idx: number) => void;
}

const AUTH_KEY = "perrot-auth";
const USERS_KEY = "perrot-users";

// Roles disponibles
export const ALL_ROLES = [
  "cliente",
  "comercial",
  "torre de control",
  "operaciones",
  "contabilidad",
  "administracion",
];

// Usuarios iniciales
const defaultUsers: UserAccount[] = [
  {
    username: "cliente",
    password: "cliente123",
    roles: ["cliente"],
    userName: "Cliente Test",
  },
  {
    username: "comercial",
    password: "comercial123",
    roles: ["comercial"],
    userName: "Comercial Test",
  },
  {
    username: "torre",
    password: "torre123",
    roles: ["torre de control"],
    userName: "Torre Test",
  },
  {
    username: "operaciones",
    password: "operaciones123",
    roles: ["operaciones"],
    userName: "Operaciones Test",
  },
  {
    username: "contabilidad",
    password: "contabilidad123",
    roles: ["contabilidad"],
    userName: "Contabilidad Test",
  },
  {
    username: "administracion",
    password: "administracion123",
    roles: ["administracion", "comercial", "operaciones", "torre de control"],
    userName: "Administrador",
  },
];

export const AuthContext = createContext<AuthContextProps>({
  hasAccess: false,
  roles: [],
  userName: "",
  setAuth: () => {},
  users: [],
  addUser: () => {},
  updateUser: () => {},
  deleteUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Auth
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored
        ? JSON.parse(stored)
        : { hasAccess: false, roles: [], userName: "" };
    } catch {
      return { hasAccess: false, roles: [], userName: "" };
    }
  });

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }, [auth]);

  // Users
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : defaultUsers;
    } catch {
      return defaultUsers;
    }
  });

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  const addUser = (u: UserAccount) => setUsers((prev) => [...prev, u]);
  const updateUser = (idx: number, u: UserAccount) =>
    setUsers((prev) => {
      const copy = [...prev];
      copy[idx] = u;
      return copy;
    });
  const deleteUser = (idx: number) =>
    setUsers((prev) => prev.filter((_, i) => i !== idx));

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        setAuth,
        users,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
