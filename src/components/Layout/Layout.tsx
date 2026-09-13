import { useContext } from "react";
import ActionsBar from "../ActionsBar/ActionsBar";
import { AuthContext } from "../providers/AuthProvider";
import Sidebar from "../Sidebar/Sidebar";
import MobileNavbar from "../MobileNavbar/MobileNavbar";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="h-[100dvh] max-h-[100dvh] flex flex-col bg-background relative overflow-hidden text-foreground selection:bg-purple-500/30">
      {/* Immersive background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-pink-900/20 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-900/20 blur-[120px] pointer-events-none" />

      <ActionsBar />
      
      <div className="flex flex-1 overflow-hidden z-10 p-3 md:p-6 gap-4 md:gap-6 w-full max-w-[1920px] mx-auto">
        {isAuthenticated && window.location.hash.startsWith("#/gallery") && <Sidebar />}
        <div className="grow w-full glass-panel rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-slide-up">
          {children}
        </div>
      </div>
      
      {isAuthenticated && window.location.hash.startsWith("#/gallery") && <MobileNavbar />}
    </div>
  );
};

export default Layout;

