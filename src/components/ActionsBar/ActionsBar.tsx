import { LogOut, Moon, Sun } from "lucide-react";
import { Switch } from "../ui/switch";
import { useTheme } from "../providers/ThemeProvider";
import { AuthContext } from "../providers/AuthProvider";
import { useContext } from "react";
import { Button } from "../ui/button";

const ActionsBar = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();

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
      {isAuthenticated && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            <LogOut />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActionsBar;
