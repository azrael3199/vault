import { AppStateContext } from "@/components/providers/AppStateProvider";
import { AuthContext } from "@/components/providers/AuthProvider";
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
import { Vault } from "lucide-react";
import { useContext, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type Inputs = {
  username: string;
  passcode: string;
};

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const { setLoading } = useContext(AppStateContext);
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  const { toast } = useToast();

  //   const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const value = e.target.value;
  //     const newValue = value.replace(/[^0-9]/g, "").slice(0, 30);
  //     setValue("passcode", newValue, { shouldValidate: true });
  //   };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { username, passcode } = data;
    if (username && username.length > 0 && passcode && passcode.length > 0) {
      setLoading("Logging In");
      try {
        const storage = getStorage();
        const res = await storage.login(username, passcode);
        if (res && res.authenticated === true) {
          localStorage.setItem("userId", res.username as string);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Invalid username or passcode",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: (error as Error).message,
        });
        console.log(error);
      } finally {
        setLoading(null);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="h-full w-full p-4 flex flex-col justify-center items-center relative overflow-hidden animate-fade-in">
      <div className="z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <div className="flex justify-center items-center gap-3 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
              <Vault className="w-8 h-8 text-foreground" />
            </div>
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 title pb-2">
            Vault.
          </h1>
        </div>
        
        <Card className="w-full glass-panel border-purple-500/20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to unlock your vault.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-foreground/80 ml-1">Username</Label>
                <Input
                  id="username"
                  className="bg-background/50 border-white/10 dark:border-white/5 focus-visible:ring-purple-500/50 h-12 rounded-xl px-4 text-base transition-all hover:bg-background/80"
                  placeholder="Enter your username"
                  {...register("username", {
                    required: "Username is required",
                    pattern: {
                      value: /^[a-zA-Z0-9_-]*$/,
                      message: "Username cannot contain spaces",
                    },
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
                <Label htmlFor="passcode" className="text-sm font-medium text-foreground/80 ml-1">Passcode</Label>
                <Input
                  id="passcode"
                  type="password"
                  className="bg-background/50 border-white/10 dark:border-white/5 focus-visible:ring-purple-500/50 h-12 rounded-xl px-4 text-base transition-all hover:bg-background/80"
                  placeholder="Enter your passcode"
                  {...register("passcode", {
                    required: "Passcode is required",
                    pattern: {
                      value: /^[0-9]*$/,
                      message:
                        "Passcode must be numeric",
                    },
                    validate: (value) =>
                      value.trim().length > 0 || "Passcode cannot be empty",
                  })}
                />
                {errors.passcode && (
                  <span className="text-red-500 text-xs font-medium ml-1">
                    {errors.passcode.message}
                  </span>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2 pb-8">
            <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold text-lg transition-all shadow-lg hover:shadow-purple-500/30 border-0" onClick={handleSubmit(onSubmit)}>
              Unlock Vault
            </Button>
            <Button
              variant="ghost"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors h-auto py-2"
              onClick={() => {
                navigate("/register");
              }}
            >
              Don't have a vault? Create one
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;

