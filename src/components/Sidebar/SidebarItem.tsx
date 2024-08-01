import clsx from "clsx";

type Props = {
  selected?: boolean;
  icon: JSX.Element;
  itemName: string;
};

const SidebarItem = ({ selected, icon, itemName }: Props) => {
  return (
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
        className={clsx("text-gray-400 px-1 py-2 truncate grow-0 col-span-6", {
          "text-gray-900 font-semibold": selected,
        })}
      >
        {itemName}
      </p>
    </div>
  );
};

export default SidebarItem;
