import { createContext, Dispatch, SetStateAction, useState } from "react";
import { Toaster } from "../ui/toaster";
import GlobalLoader from "../GlobalLoader/GlobalLoader";

interface AppState {
  loading: string | null;
  setLoading: Dispatch<SetStateAction<string | null>>;
}

export const AppStateContext = createContext<AppState>({
  loading: null,
  setLoading: () => null,
});

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  return (
    <AppStateContext.Provider
      value={{
        loading,
        setLoading,
      }}
    >
      {children}
      <GlobalLoader message={loading} />
      <Toaster />
    </AppStateContext.Provider>
  );
};
