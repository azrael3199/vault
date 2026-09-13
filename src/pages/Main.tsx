import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppStateContext } from "@/components/providers/AppStateProvider";
import { Server, Wifi, WifiOff, Vault, Image as ImageIcon, Music, RefreshCw } from "lucide-react";
import { ThemedIcon } from "@/components/ui/ThemedIcon";
import { BrandIcon } from "@/components/ui/BrandIcon";

const Main = () => {
  const navigate = useNavigate();
  const { serverStatus, serverIp } = useContext(AppStateContext);

  return (
    <div className="h-full w-full p-6 md:p-12 flex flex-col relative overflow-y-auto">
      <div className="z-10 flex flex-col items-center gap-10 text-center max-w-2xl mx-auto my-auto pt-16 pb-12">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/10 dark:bg-white/5 border border-white/10 backdrop-blur-md shadow-sm animate-fade-in">
          {serverStatus === "scanning" && (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <span className="text-xs font-semibold text-orange-400/90">Searching Network...</span>
            </>
          )}
          {serverStatus === "connected" && (
            <>
              <Wifi className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-500/90">Server Connected ({serverIp})</span>
            </>
          )}
          {serverStatus === "offline" && (
            <>
              <WifiOff className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold text-rose-500/90">Server Offline</span>
            </>
          )}
        </div>
        <div className="space-y-6 animate-slide-up">
          <BrandIcon className="w-28 h-28 mx-auto rounded-[2rem] shadow-[0_0_40px_rgba(0,240,255,0.4)] dark:shadow-[0_0_40px_rgba(0,240,255,0.2)]" />
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-vault-gradient py-2">
            Welcome to Vault.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Your highly secure, beautifully crafted local space to encrypt, store, and view images seamlessly.
          </p>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Card
            className="w-72 glass-panel hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-300 hover:scale-105 cursor-pointer group border-transparent hover:border-cyan-500/30 relative overflow-hidden"
            onClick={() => navigate("/gallery")}
          >
            <div className="absolute inset-0 bg-vault-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
            <CardHeader className="text-center flex flex-col items-center gap-2">
              <ThemedIcon icon={ImageIcon} size="lg" className="mb-2" />
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-blue-500 transition-all">
                Enter Gallery
              </CardTitle>
              <CardDescription className="text-sm mt-1 text-muted-foreground group-hover:text-foreground/80 transition-colors">
                Browse, upload, and securely manage your encrypted images in a stunning theater view.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="w-72 glass-panel hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-300 hover:scale-105 cursor-pointer group border-transparent hover:border-cyan-500/30 relative overflow-hidden"
            onClick={() => navigate("/audio")}
          >
            <div className="absolute inset-0 bg-vault-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
            <CardHeader className="text-center flex flex-col items-center gap-2">
              <ThemedIcon icon={Music} size="lg" className="mb-2" />
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-blue-500 transition-all">
                Enter Audio
              </CardTitle>
              <CardDescription className="text-sm mt-1 text-muted-foreground group-hover:text-foreground/80 transition-colors">
                Listen, upload, and securely manage your encrypted audio files and recordings.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="w-72 glass-panel hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-300 hover:scale-105 cursor-pointer group border-transparent hover:border-cyan-500/30 relative overflow-hidden"
            onClick={() => navigate("/sync")}
          >
            <div className="absolute inset-0 bg-vault-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
            <CardHeader className="text-center flex flex-col items-center gap-2">
              <ThemedIcon icon={RefreshCw} size="lg" className="mb-2" />
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-blue-500 transition-all">
                Mobile Sync
              </CardTitle>
              <CardDescription className="text-sm mt-1 text-muted-foreground group-hover:text-foreground/80 transition-colors">
                Synchronize your vault directly with your Windows PC over local Wi-Fi.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Main;

