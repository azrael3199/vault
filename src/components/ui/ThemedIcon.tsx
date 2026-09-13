import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/ui";

interface ThemedIconProps {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  iconClassName?: string;
  gradientClassName?: string;
}

export function ThemedIcon({ 
  icon: Icon, 
  size = "md", 
  className,
  iconClassName,
  gradientClassName
}: ThemedIconProps) {
  
  const sizeMap = {
    sm: {
      wrapper: "w-8 h-8 md:w-10 md:h-10 p-[2px] rounded-xl",
      inner: "rounded-lg",
      icon: "w-4 h-4 md:w-5 md:h-5",
    },
    md: {
      wrapper: "w-12 h-12 md:w-16 md:h-16 p-[2px] rounded-2xl",
      inner: "rounded-[14px]",
      icon: "w-6 h-6 md:w-8 md:h-8",
    },
    lg: {
      wrapper: "w-16 h-16 md:w-20 md:h-20 p-[2px] md:p-[3px] rounded-2xl md:rounded-[24px]",
      inner: "rounded-[14px] md:rounded-[21px]",
      icon: "w-8 h-8 md:w-10 md:h-10",
    },
    xl: {
      wrapper: "w-24 h-24 p-[3px] rounded-3xl",
      inner: "rounded-[21px]",
      icon: "w-12 h-12 md:w-16 md:h-16",
    },
  };

  const selectedSize = sizeMap[size];

  return (
    <div 
      className={cn(
        "bg-vault-gradient shadow-lg shadow-cyan-500/30 flex items-center justify-center shrink-0",
        selectedSize.wrapper,
        gradientClassName,
        className
      )}
    >
      <div 
        className={cn(
          "w-full h-full bg-background/90 flex items-center justify-center backdrop-blur-md",
          selectedSize.inner
        )}
      >
        <Icon className={cn("text-foreground", selectedSize.icon, iconClassName)} />
      </div>
    </div>
  );
}
