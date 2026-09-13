import { AppStateContext } from "@/components/providers/AppStateProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getStorage } from "@/lib/storage";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type Inputs = {
  username: string;
  recoveryKey: string;
  newPasscode: string;
};

const Recover = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const { setLoading } = useContext(AppStateContext);
  const { toast } = useToast();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { username, recoveryKey, newPasscode } = data;
    if (username && recoveryKey && newPasscode) {
      setLoading("Recovering Vault");
      try {
        const storage = getStorage();
        if (!storage.recover) {
          throw new Error("Recovery is not supported by the current storage adapter.");
        }
        
        const res = await storage.recover(username, recoveryKey, newPasscode);
        if (res && res.success === true) {
          toast({
            title: "Success",
            description: "Vault recovered successfully. You may now login.",
          });
          navigate("/login");
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Invalid recovery key or username",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: (error as Error).message,
        });
      } finally {
        setLoading(null);
      }
    }
  };

  return (
    <div className="h-full w-full p-4 flex flex-col justify-center items-center relative overflow-hidden animate-fade-in">
      <div className="z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <div className="flex justify-center items-center gap-3 animate-slide-up">
          <BrandIcon className="w-16 h-16 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.4)] dark:shadow-[0_0_30px_rgba(0,240,255,0.2)]" />
          <h1 className="text-6xl font-extrabold tracking-tight text-vault-gradient title pb-2">
            Vault.
          </h1>
        </div>
        
        <Card className="w-full glass-panel border-cyan-500/20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-bold tracking-tight">Recover Vault</CardTitle>
            <CardDescription className="text-base">
              Enter your Recovery Key to reset your passcode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-foreground/80 ml-1">Username</Label>
                <Input
                  id="username"
                  className="bg-background/50 border-white/10 dark:border-white/5 focus-visible:ring-cyan-500/50 h-12 rounded-xl px-4 text-base transition-all hover:bg-background/80"
                  placeholder="Enter your username"
                  {...register("username", {
                    required: "Username is required",
                    validate: (value) =>
                      value.trim().length > 0 ||
                      "Username cannot be empty",
                  })}
                />
                {errors.username && (
                  <span className="text-red-500 text-xs font-medium ml-1">
                    {errors.username.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="recoveryKey" className="text-sm font-medium text-foreground/80 ml-1">Recovery Key</Label>
                <Input
                  id="recoveryKey"
                  type="text"
                  className="bg-background/50 border-white/10 dark:border-white/5 focus-visible:ring-cyan-500/50 h-12 rounded-xl px-4 text-base font-mono transition-all hover:bg-background/80"
                  placeholder="e.g. a1b2c3d4-..."
                  {...register("recoveryKey", {
                    required: "Recovery Key is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Recovery Key cannot be empty",
                  })}
                />
                {errors.recoveryKey && (
                  <span className="text-red-500 text-xs font-medium ml-1">
                    {errors.recoveryKey.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="newPasscode" className="text-sm font-medium text-foreground/80 ml-1">New Passcode</Label>
                <Input
                  id="newPasscode"
                  type="password"
                  className="bg-background/50 border-white/10 dark:border-white/5 focus-visible:ring-cyan-500/50 h-12 rounded-xl px-4 text-base transition-all hover:bg-background/80"
                  placeholder="Create a new numeric passcode"
                  {...register("newPasscode", {
                    required: "New Passcode is required",
                    pattern: {
                      value: /^[0-9]*$/,
                      message: "Passcode must be numeric",
                    },
                    validate: (value) =>
                      value.trim().length > 0 || "Passcode cannot be empty",
                  })}
                />
                {errors.newPasscode && (
                  <span className="text-red-500 text-xs font-medium ml-1">
                    {errors.newPasscode.message}
                  </span>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2 pb-8">
            <Button className="w-full h-12 rounded-xl bg-vault-gradient hover:opacity-90 text-white font-semibold text-lg transition-all shadow-lg hover:shadow-cyan-500/30 border-0" onClick={handleSubmit(onSubmit)}>
              Recover Vault
            </Button>
            <Button
              variant="ghost"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors h-auto py-2"
              onClick={() => {
                navigate("/login");
              }}
            >
              Remembered your passcode? Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Recover;
