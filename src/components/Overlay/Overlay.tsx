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
    <div className="h-full w-full bg-transparent absolute top-0 left-0 z-10">
      <div className="flex justify-between gap-3 p-0 m-0">
        <span className="text-lg text-gray-100 bg-black/50 px-4 py-2 truncate">
          {filename}
        </span>
        <div className="bg-black/50 flex items-center rounded-md p-0 mr-1">
          <Button variant="link" className="h-full" onClick={onDownload}>
            <Download className="w-5 h-5 text-gray-200" />
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center h-full w-full">
        <Button variant="link" className="h-full bg-black/5">
          <ChevronLeft onClick={onPrev} className="w-7 h-7 text-gray-200" />
        </Button>
        <Button variant="link" className="h-full bg-black/5">
          <ChevronRight onClick={onNext} className="w-7 h-7 text-gray-200" />
        </Button>
      </div>
    </div>
  );
};

export default Overlay;
