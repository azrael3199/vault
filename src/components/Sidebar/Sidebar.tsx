import FileSelectionMenu from "./FileSelectionMenu";

const Sidebar = () => {
  return (
    <div className="hidden md:flex h-full flex-col gap-3 border rounded-r-md w-[270px] py-3 pl-3">
      <FileSelectionMenu />
    </div>
  );
};

export default Sidebar;
