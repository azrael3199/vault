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
  passcode: string;
};

const username = "Azrael";

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();

  const { setLoading } = useContext(AppStateContext);
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  const { toast } = useToast();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newValue = value.replace(/[^0-9]/g, "").slice(0, 30);
    setValue("passcode", newValue, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { passcode } = data;
    if (passcode && passcode.length > 0) {
      setLoading("Signing in");
      try {
        const res = await userLogin(username, passcode);
        if (res && res.data?.authenticated === true) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Invalid passcode",
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
          <CardTitle>Hi Azrael!</CardTitle>
          <CardDescription>Please enter your code to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="p-2">
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
                onInput={handleInput}
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
