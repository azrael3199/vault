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
import { userLogin } from "@/lib/apis/login";
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
        const res = await userLogin(username, passcode);
        if (res && res.data?.authenticated === true) {
          sessionStorage.setItem("userId", res.data.username);
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
    <div className="md:h-full bg-background p-4 flex flex-col gap-8 justify-center items-center">
      <div className="flex justify-center items-center gap-1">
        <Vault className="w-10 h-10 text-yellow-500" />
        <h1 className="text-4xl title">Vault.</h1>
      </div>
      <Card className="w-full md:w-[350px] mb-12">
        <CardHeader>
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription>
            Please enter your credentials to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="p-2">
            <div className="flex flex-col space-y-1.5 mb-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                {...register("username", {
                  required: "Username is required",
                  pattern: {
                    value: /^[a-zA-Z0-9_-]*$/,
                    message: "Username cannot contain spaces",
                  },
                  validate: (value) =>
                    value.trim().length > 0 ||
                    "Username cannot contain spaces & cannot be empty",
                })}
                // onInput={handleInput}
              />
              {errors.passcode && (
                <span className="text-red-500 text-xs">
                  {errors.passcode.message}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="passcode">Code</Label>
              <Input
                id="passcode"
                placeholder="Enter your passcode"
                {...register("passcode", {
                  required: "Passcode is required",
                  pattern: {
                    value: /^[0-9]*$/,
                    message:
                      "Passcode must be numeric and must not contain spaces",
                  },
                  validate: (value) =>
                    value.trim().length > 0 || "Passcode cannot contain spaces",
                })}
                // onInput={handleInput}
              />
              {errors.passcode && (
                <span className="text-red-500 text-xs">
                  {errors.passcode.message}
                </span>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button className="bg-primary" onClick={handleSubmit(onSubmit)}>
            Login
          </Button>
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => {
              navigate("/register");
            }}
          >
            New? Register here
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
