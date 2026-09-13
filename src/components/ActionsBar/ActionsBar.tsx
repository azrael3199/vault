"use client";

import { KeyRound, LogOut, Moon, Sun, Vault } from "lucide-react";
import { Switch } from "../ui/switch";
import { useTheme } from "../providers/ThemeProvider";
import { AuthContext } from "../providers/AuthProvider";
import { useContext, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { useNavigate, useLocation } from "react-router-dom";
import { getStorage } from "@/lib/storage";
import { useToast } from "../ui/use-toast";
import { BrandIcon } from "../ui/BrandIcon";

const ActionsBar = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onThemeChange = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const handleGenerateKey = async () => {
    if (!passcode) return;
    setLoading(true);
    try {
      const storage = getStorage();
      if (!storage.generateRecoveryKey) throw new Error("Not supported.");
      const username = localStorage.getItem("userId") || "";
      const res = await storage.generateRecoveryKey(username, passcode);
      if (res && res.success && res.recoveryKey) {
        setRecoveryKey(res.recoveryKey as string);
        toast({ title: "Success", description: "Recovery key generated." });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Invalid passcode." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 md:px-8 py-4 w-full max-w-[1920px] mx-auto z-20 gap-2 shrink-0">
      <div className="flex-1 flex justify-start">
        <div className="flex items-center justify-center gap-3 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20 dark:border-white/10 transition-all hover:shadow-xl w-fit">
          <Sun className="w-4 h-4 text-amber-500" />
          <Switch
            id="dark-mode"
            className="h-5 w-9 data-[state=checked]:bg-cyan-500 shrink-0"
            disabled={theme === "system"}
            slotProps={{
              thumb: {
                className: "w-4 h-4 data-[state=checked]:translate-x-4 shadow-md",
              },
            }}
            onCheckedChange={onThemeChange}
            checked={theme === "dark"}
          />
          <Moon className="w-4 h-4 text-indigo-400" />
        </div>
      </div>
      
      {!isAuthRoute ? (
        <div className="flex-1 flex justify-center">
          <div
            className="flex justify-center items-center gap-2 md:gap-3 hover:cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <BrandIcon className="w-8 h-8 md:w-10 md:h-10 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] dark:shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
            <h1 className="text-xl md:text-2xl font-extrabold text-vault-gradient title tracking-tight group-hover:opacity-80 transition-opacity">
              Vault.
            </h1>
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex-1 flex justify-end">
        {isAuthenticated && (
          <div className="flex items-center justify-center gap-1 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-full p-1 shadow-lg border border-white/20 dark:border-white/10 w-fit shrink-0">
            <Button
              variant="ghost"
              onClick={() => {
                setPasscode("");
                setRecoveryKey(null);
                setDialogOpen(true);
              }}
              className="rounded-full w-8 h-8 md:w-10 md:h-10 p-0 hover:bg-cyan-500/20 hover:text-cyan-600 text-foreground transition-all duration-300"
              title="Generate Recovery Key"
            >
              <KeyRound className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsAuthenticated(false)}
              className="rounded-full w-8 h-8 md:w-10 md:h-10 p-0 hover:bg-red-500/20 hover:text-red-600 text-foreground transition-all duration-300"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md glass-panel border-cyan-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-vault-gradient">Recovery Key</DialogTitle>
            <DialogDescription className="text-foreground/80">
              {recoveryKey 
                ? "Your new Recovery Key has been generated. Please save it securely." 
                : "Enter your current passcode to generate a new offline Recovery Key. This will replace any existing key."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 my-2">
            {!recoveryKey ? (
              <div className="flex flex-col w-full gap-2">
                <Label htmlFor="current-passcode" className="sr-only">Passcode</Label>
                <Input
                  id="current-passcode"
                  type="password"
                  placeholder="Current Passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="bg-background/50 focus-visible:ring-cyan-500/50"
                />
              </div>
            ) : (
              <div className="bg-background/80 border border-red-500/30 rounded-xl p-4 w-full text-center">
                <code className="text-xl font-mono text-cyan-400 break-all select-all">
                  {recoveryKey}
                </code>
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-start">
            {!recoveryKey ? (
              <Button type="button" onClick={handleGenerateKey} disabled={loading} className="w-full bg-vault-gradient text-white border-0 hover:opacity-90">
                {loading ? "Generating..." : "Generate Key"}
              </Button>
            ) : (
              <Button type="button" onClick={() => setDialogOpen(false)} className="w-full bg-vault-gradient text-white border-0 hover:opacity-90">
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActionsBar;

