import { LogOut, Moon, Sun, Vault } from "lucide-react";
import { Switch } from "../ui/switch";
import { useTheme } from "../providers/ThemeProvider";
import { AuthContext } from "../providers/AuthProvider";
import { useContext } from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const ActionsBar = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const onThemeChange = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <div className="flex justify-between items-start p-2 gap-3">
      <div className="p-2 flex items-center justify-center gap-2">
        <Sun className="w-5 h-5"></Sun>
        <Switch
          id="dark-mode"
          className="h-5 w-9"
          disabled={theme === "system"}
          slotProps={{
            thumb: {
              className: "w-3 h-3 data-[state=checked]:translate-x-5",
            },
          }}
          onCheckedChange={onThemeChange}
          checked={theme === "dark"}
        />
        <Moon className="w-5 h-5"></Moon>
      </div>
      {window.location.pathname !== "/login" && (
        <div
          className="flex justify-center md:mr-20 items-center gap-1 hover:cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Vault className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl title">Vault.</h1>
        </div>
      )}
      {isAuthenticated && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAuthenticated(false)}
            className="p-2"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActionsBar;
