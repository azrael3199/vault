import useSessionStorage from "@/lib/hooks/useSessionStorage";
import { createContext } from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  setIsAuthenticated: (newValue: boolean) => void;
};

export const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsAuthenticated: (_: boolean) => {},
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useSessionStorage(
    "isAuthenticated",
    false
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
