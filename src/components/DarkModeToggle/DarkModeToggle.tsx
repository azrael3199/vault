import { Moon, Sun } from "lucide-react";
import { Switch } from "../ui/switch";
import { useTheme } from "../providers/ThemeProvider";

const DarkModeToggle = () => {
  const { theme, setTheme } = useTheme();

  const onThemeChange = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <div className="z-50 fixed top-4 right-4 p-2 flex items-center justify-center gap-2">
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
      />
      <Moon className="w-5 h-5"></Moon>
    </div>
  );
};

export default DarkModeToggle;
