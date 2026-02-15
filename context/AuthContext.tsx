"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id: number;
  role: string;
  subProgramId?: number;
}

interface User {
  id: number;
  role: string;
  subProgramId?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          // ✅ Wrap dalam setTimeout
          setTimeout(() => {
            setUser({
              id: decoded.id,
              role: decoded.role,
              subProgramId: decoded.subProgramId,
            });
            setLoading(false);
          }, 0);
        } catch (error) {
          console.error("Invalid token:", error);
          setUser(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
