import React, { createContext, useState, ReactNode } from "react";

interface AuthState {
  hasAccess: boolean;
  roles: string[];
  userName: string;
}

interface AuthContextProps extends AuthState {
  setAuth: (auth: AuthState) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  hasAccess: false,
  roles: [],
  userName: "",
  setAuth: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    hasAccess: false,
    roles: [],
    userName: "",
  });

  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
