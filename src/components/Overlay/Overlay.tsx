import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

type Props = {
  filename: string;
  onPrev: () => void;
  onNext: () => void;
};

const Overlay = ({ filename, onPrev, onNext }: Props) => {
  return (
    <div className="h-full w-full bg-transparent absolute top-0 left-0 z-10">
      <span className="text-lg text-gray-100 bg-black/50 px-4 py-2 truncate">
        {filename}
      </span>
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
