import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="z-10 flex flex-col items-center gap-10 text-center max-w-2xl mx-auto">
        <div className="space-y-6 animate-slide-up">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[3px] rounded-3xl shadow-2xl shadow-purple-500/30">
            <div className="w-full h-full bg-background/90 rounded-[21px] flex items-center justify-center backdrop-blur-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-2">
            Welcome to Vault.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Your highly secure, beautifully crafted local space to encrypt, store, and view images seamlessly.
          </p>
        </div>

        <div className="flex gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Card
            className="w-72 glass-panel hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer group border-purple-500/30"
            onClick={() => navigate("/gallery")}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 group-hover:from-purple-500 group-hover:to-pink-500 transition-all">
                Enter Gallery
              </CardTitle>
              <CardDescription className="text-sm mt-3 text-muted-foreground group-hover:text-foreground/80 transition-colors">
                Browse, upload, and securely manage your encrypted images in a stunning theater view.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Main;
