import FileSelectionMenu from "./FileSelectionMenu";

const Sidebar = () => {
  return (
    <div className="hidden md:flex h-full flex-col w-[300px] glass-panel rounded-3xl p-4 animate-fade-in shadow-xl">
      <FileSelectionMenu />
    </div>
  );
};

export default Sidebar;
