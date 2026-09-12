import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "../ui/button";

type Props = {
  filename: string;
  onPrev: () => void;
  onNext: () => void;
  onDownload: () => void;
};

const Overlay = ({ filename, onPrev, onNext, onDownload }: Props) => {
  return (
    <div className="h-full w-full absolute inset-0 z-10 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start w-full pointer-events-auto group/overlay">
        <div className="text-sm font-semibold text-foreground/90 bg-white/20 dark:bg-black/30 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/10 shadow-lg truncate max-w-[50%] opacity-0 group-hover/overlay:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover/overlay:translate-y-0">
          {filename}
        </div>
        <Button variant="outline" className="h-12 w-12 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/40 dark:hover:bg-black/50 transition-all duration-300 hover:scale-110 p-0 flex items-center justify-center text-foreground/90 opacity-0 group-hover/overlay:opacity-100 transform -translate-y-2 group-hover/overlay:translate-y-0" onClick={onDownload}>
          <Download className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="absolute inset-y-0 left-4 md:left-8 flex items-center pointer-events-auto opacity-0 hover:opacity-100 transition-opacity duration-300">
        <Button variant="outline" className="h-14 w-14 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/40 dark:hover:bg-black/50 transition-all hover:scale-110 p-0 flex items-center justify-center text-foreground/90 group" onClick={onPrev}>
          <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-4 md:right-8 flex items-center pointer-events-auto opacity-0 hover:opacity-100 transition-opacity duration-300">
        <Button variant="outline" className="h-14 w-14 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/40 dark:hover:bg-black/50 transition-all hover:scale-110 p-0 flex items-center justify-center text-foreground/90 group" onClick={onNext}>
          <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default Overlay;
