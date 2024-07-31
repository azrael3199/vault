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
    <div className="h-full p-3 gap-12 flex flex-col items-center justify-center">
      <h1 className="text-3xl text-center">What are you looking for?</h1>
      <div className="mb-12 jutify-center items-center gap-3">
        <Card
          className="w-fit hover:cursor-pointer hover:bg-accent hover:text-accent-foreground"
          onClick={() => navigate("/gallery")}
        >
          <CardHeader>
            <CardTitle>Images / Videos</CardTitle>
            <CardDescription>Find / Upload images and videos</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Main;
