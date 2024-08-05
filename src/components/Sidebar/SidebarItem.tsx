import clsx from "clsx";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { getFormattedDate } from "@/lib/utils/misc";

type Props = {
  selected?: boolean;
  icon: JSX.Element;
  itemName: string;
  itemDate: string;
  itemSize: number;
};

const SidebarItem = ({
  selected,
  icon,
  itemName,
  itemDate,
  itemSize,
}: Props) => {
  const formattedDate = getFormattedDate(itemDate);
  const sizeInMb = (itemSize / (1024 * 1024)).toFixed(2);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={clsx(
              "grid grid-cols-7 grid-rows-1 rounded-md px-1 items-center hover:cursor-pointer ml-2 mr-4",
              {
                "bg-gray-500": selected,
                "hover:bg-gray-800": !selected,
              }
            )}
          >
            <div className="h-full w-full flex items-center">{icon}</div>
            <p
              className={clsx(
                "text-gray-400 px-1 py-2 truncate grow-0 col-span-6",
                {
                  "text-gray-900 font-semibold": selected,
                }
              )}
            >
              {itemName}
            </p>
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
