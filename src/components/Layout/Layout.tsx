type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return <div className="w-screen h-screen bg-background">{children}</div>;
};

export default Layout;
