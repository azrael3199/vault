import { useContext } from "react";
import ActionsBar from "../ActionsBar/ActionsBar";
import { AuthContext } from "../providers/AuthProvider";
import Sidebar from "../Sidebar/Sidebar";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="h-screen flex flex-col">
      <ActionsBar />
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && window.location.pathname !== "/" && <Sidebar />}
        <div className="grow py-3 m-3 mr-2 mt-0 border rounded-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
