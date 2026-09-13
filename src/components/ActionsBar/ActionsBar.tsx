"use client";

import { LogOut, Moon, Sun, Vault } from "lucide-react";
import { Switch } from "../ui/switch";
import { useTheme } from "../providers/ThemeProvider";
import { AuthContext } from "../providers/AuthProvider";
import { useContext } from "react";
import { Button } from "../ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const ActionsBar = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";

  const onThemeChange = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <div className="flex justify-between items-center px-4 md:px-8 py-4 w-full max-w-[1920px] mx-auto z-20 gap-2 shrink-0">
      <div className="flex-1 flex justify-start">
        <div className="flex items-center justify-center gap-3 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20 dark:border-white/10 transition-all hover:shadow-xl w-fit">
          <Sun className="w-4 h-4 text-amber-500" />
          <Switch
            id="dark-mode"
            className="h-5 w-9 data-[state=checked]:bg-purple-500 shrink-0"
            disabled={theme === "system"}
            slotProps={{
              thumb: {
                className: "w-4 h-4 data-[state=checked]:translate-x-4 shadow-md",
              },
            }}
            onCheckedChange={onThemeChange}
            checked={theme === "dark"}
          />
          <Moon className="w-4 h-4 text-indigo-400" />
        </div>
      </div>
      
      {!isAuthRoute ? (
        <div className="flex-1 flex justify-center">
          <div
            className="flex justify-center items-center gap-2 md:gap-3 hover:cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg group-hover:shadow-purple-500/30 transition-all group-hover:scale-110 duration-300 shrink-0">
              <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                <Vault className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent title tracking-tight group-hover:opacity-80 transition-opacity">
              Vault.
            </h1>
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex-1 flex justify-end">
        {isAuthenticated && (
          <div className="flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-full p-1 shadow-lg border border-white/20 dark:border-white/10 w-fit shrink-0">
            <Button
              variant="ghost"
              onClick={() => setIsAuthenticated(false)}
              className="rounded-full w-8 h-8 md:w-10 md:h-10 p-0 hover:bg-red-500/20 hover:text-red-600 text-foreground transition-all duration-300"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsBar;

