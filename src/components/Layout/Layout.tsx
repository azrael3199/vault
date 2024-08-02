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
    <div className="h-screen max-h-screen flex flex-col">
      <ActionsBar />
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && window.location.pathname !== "/" && <Sidebar />}
        <div className="md:grow w-full py-3 m-3 mr-2 mt-0 border rounded-md">
          {children}
        </div>
      </div>
      {isAuthenticated && window.location.pathname !== "/" && <MobileNavbar />}
    </div>
  );
};

export default Layout;
