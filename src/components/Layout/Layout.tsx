import { useContext } from "react";
import ActionsBar from "../ActionsBar/ActionsBar";
import { AuthContext } from "../providers/AuthProvider";
import Sidebar from "../Sidebar/Sidebar";
import MobileNavbar from "../MobileNavbar/MobileNavbar";
import { useLocation } from "react-router-dom";
import { CyberBackground } from "../ui/CyberBackground";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const isVaultRoute = location.pathname.startsWith("/gallery") || location.pathname.startsWith("/audio");

  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden text-foreground selection:bg-cyan-500/30">
      <CyberBackground />

      <ActionsBar />
      
      <div className="flex flex-1 overflow-hidden z-10 p-3 md:p-6 gap-4 md:gap-6 w-full max-w-[1920px] mx-auto">
        {isAuthenticated && isVaultRoute && <Sidebar />}
        <div className="grow w-full glass-panel rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-slide-up">
          {children}
        </div>
      </div>
      
      {isAuthenticated && isVaultRoute && <MobileNavbar />}
    </div>
  );
};

export default Layout;

