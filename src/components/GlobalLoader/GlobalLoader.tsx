import { Dialog, DialogContent } from "../ui/dialog";
import LoadingSpinner from "./LoadingSpinner";

type Props = {
  message: string | null;
};

const GlobalLoader = ({ message }: Props) => {
  if (!message) return <></>;

  return (
    <Dialog defaultOpen={!!message}>
      <DialogContent
        className="flex flex-col items-center justify-center gap-3 w-fit p-4"
        slotProps={{ close: { className: "hidden" } }}
      >
        <LoadingSpinner />
        <span>{message}</span>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalLoader;
