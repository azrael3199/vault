import { useTheme } from "@/components/providers/ThemeProvider";

interface BrandIconProps {
  className?: string;
}

export function BrandIcon({ className }: BrandIconProps) {
  const { theme } = useTheme();
  
  // Try to use actual HTML class first for system theme responsiveness, fallback to theme state
  const isDark = 
    theme === "dark" || 
    (theme === "system" && document.documentElement.classList.contains("dark"));

  return (
    <img 
      src={isDark ? "/icon.png" : "/icon-light.png"} 
      alt="Vault Icon" 
      className={className} 
    />
  );
}
