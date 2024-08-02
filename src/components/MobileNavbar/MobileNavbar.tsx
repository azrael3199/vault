import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import FileSelectionMenu from "../Sidebar/FileSelectionMenu";
import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Drawer
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        onDrag={() => {}}
      >
        <div className="fixed bottom-0 w-full flex justify-center p-2 bg-background border border-top rounded-t-lg z-50">
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="p-2 bg-transparent rounded-full"
              onClick={() => {
                setIsOpen(true);
              }}
            >
              {!isOpen ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </Button>
          </DrawerTrigger>
        </div>
        <DrawerContent>
          <div
            className="h-[540px] p-3"
            onClick={(event) => {
              if (isOpen) {
                const drawerContainer = document.getElementById("sidebar");
                if (
                  drawerContainer &&
                  !drawerContainer.contains(event.target as Node)
                ) {
                  setIsOpen(false);
                }
              }
            }}
          >
            <FileSelectionMenu />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileNavbar;
