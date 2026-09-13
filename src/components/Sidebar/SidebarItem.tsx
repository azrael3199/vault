import clsx from "clsx";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { getFormattedDate } from "@/lib/utils/misc";
import { Star } from "lucide-react";

type Props = {
  selected?: boolean;
  icon: JSX.Element;
  itemName: string;
  itemDate: string;
  itemSize: number;
  isFavorite?: boolean;
  isFavoriteHandler?: () => void;
};

const SidebarItem = ({
  selected,
  icon,
  itemName,
  itemDate,
  itemSize,
  isFavorite,
  isFavoriteHandler,
}: Props) => {
  const formattedDate = getFormattedDate(itemDate);
  const sizeInMb = (itemSize / (1024 * 1024)).toFixed(2);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={clsx(
              "grid grid-cols-8 grid-rows-1 rounded-xl px-2 items-center hover:cursor-pointer mx-1 my-[2px] transition-all duration-300 h-[calc(100%-4px)]",
              {
                "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 shadow-sm border border-cyan-500/30 dark:border-cyan-500/20": selected,
                "hover:bg-white/40 dark:hover:bg-black/40 border border-transparent hover:shadow-sm": !selected,
              }
            )}
          >
            <div className="h-full w-full flex items-center justify-center transition-transform group-hover:scale-110">{icon}</div>
            <p
              className={clsx(
                "text-gray-700 dark:text-gray-300 px-2 text-[13px] truncate grow-0 col-span-6 transition-all duration-300",
                {
                  "text-cyan-700 dark:text-cyan-300 font-bold": selected,
                  "font-medium": !selected,
                }
              )}
            >
              {itemName}
            </p>
            <div className="flex items-center justify-center h-full w-full opacity-70 hover:opacity-100 transition-opacity">
              <Star
                className={clsx("w-[14px] h-[14px] transition-all duration-300 hover:scale-125", {
                  "text-yellow-500 fill-yellow-500 drop-shadow-sm": isFavorite,
                  "text-gray-400 dark:text-gray-500 hover:text-yellow-500": !isFavorite,
                })}
                onClick={isFavoriteHandler}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-background border rounded-md p-2 mb-2">
          <p>{formattedDate}</p>
          <p>{`${sizeInMb} MB`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SidebarItem;

