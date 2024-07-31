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
    <div className="w-screen h-screen bg-background flex flex-col">
      <ActionsBar />
      <div className="grow h-full flex">
        {isAuthenticated && window.location.pathname !== "/" && <Sidebar />}
        <div className="grow h-full">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
