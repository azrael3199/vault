import { ChevronLeft, ChevronRight, Download, X, Maximize, Minimize } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

type Props = {
  filename: string;
  onPrev: () => void;
  onNext: () => void;
  onDownload: () => void;
  isInteractive: boolean;
  toggleInteractive: () => void;
};

const Overlay = ({ filename, onPrev, onNext, onDownload, isInteractive, toggleInteractive }: Props) => {
  const navigate = useNavigate();
  return (
    <div className="h-full w-full absolute inset-0 z-10 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start w-full pointer-events-none group/overlay">
        <div className="flex items-center gap-3">
          {!isInteractive && Capacitor.isNativePlatform() && (
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="pointer-events-auto h-12 w-12 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/40 dark:hover:bg-black/50 transition-all duration-300 hover:scale-110 p-0 flex items-center justify-center text-foreground/90 opacity-100 md:opacity-0 md:group-hover/overlay:opacity-100 transform translate-y-0 md:-translate-y-2 md:group-hover/overlay:translate-y-0"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
          {!isInteractive && (
            <div className="pointer-events-auto text-sm font-semibold text-foreground/90 bg-white/20 dark:bg-black/30 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-lg truncate max-w-[50%] opacity-100 md:opacity-0 md:group-hover/overlay:opacity-100 transition-all duration-300 transform translate-y-0 md:-translate-y-2 md:group-hover/overlay:translate-y-0">
              {filename}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {Capacitor.isNativePlatform() && (
            <Button variant="outline" className="pointer-events-auto h-12 w-12 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/40 dark:hover:bg-black/50 transition-all duration-300 hover:scale-110 p-0 flex items-center justify-center text-foreground/90 opacity-100 md:opacity-0 md:group-hover/overlay:opacity-100 transform translate-y-0 md:-translate-y-2 md:group-hover/overlay:translate-y-0" onClick={toggleInteractive}>
              {isInteractive ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          )}
          {!isInteractive && (
            <Button variant="outline" className="pointer-events-auto h-12 w-12 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/40 dark:hover:bg-black/50 transition-all duration-300 hover:scale-110 p-0 flex items-center justify-center text-foreground/90 opacity-100 md:opacity-0 md:group-hover/overlay:opacity-100 transform translate-y-0 md:-translate-y-2 md:group-hover/overlay:translate-y-0" onClick={onDownload}>
              <Download className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
      
      {!isInteractive && (
        <>
          <div className="absolute inset-y-0 left-4 md:left-8 flex items-center pointer-events-none opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity duration-300">
            <Button variant="outline" className="pointer-events-auto h-14 w-14 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/40 dark:hover:bg-black/50 transition-all hover:scale-110 p-0 flex items-center justify-center text-foreground/90 group" onClick={onPrev}>
              <ChevronLeft className="w-8 h-8 md:group-hover:-translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="absolute inset-y-0 right-4 md:right-8 flex items-center pointer-events-none opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity duration-300">
            <Button variant="outline" className="pointer-events-auto h-14 w-14 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/40 dark:hover:bg-black/50 transition-all hover:scale-110 p-0 flex items-center justify-center text-foreground/90 group" onClick={onNext}>
              <ChevronRight className="w-8 h-8 md:group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Overlay;

