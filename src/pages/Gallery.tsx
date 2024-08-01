import LoadingSpinner from "@/components/GlobalLoader/LoadingSpinner";
import Overlay from "@/components/Overlay/Overlay";
import { AppStateContext } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/ui/use-toast";
import { downloadFile } from "@/lib/apis/file";
import { useContext, useEffect, useState } from "react";

const Gallery = () => {
  const { selectedFile } = useContext(AppStateContext);
  const { toast } = useToast();

  const [dataURL, setDataURL] = useState("");

  const fetchContent = async () => {
    if (selectedFile?.id && selectedFile?.type) {
      try {
        const res = await downloadFile(selectedFile.id, "image");
        console.log(res);
        if (res.data.content) {
          setDataURL(
            `data:image/${selectedFile.type};base64,${res.data.content}`
          );
        } else {
          throw new Error("Failed to fetch content");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: (error as Error).message,
        });
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (selectedFile?.id && selectedFile?.type) {
      if (selectedFile.content) {
        setDataURL(selectedFile.content);
      } else {
        fetchContent();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="h-full w-full relative overflow-hidden">
        <h1 className="text-3xl text-center text-gray-600 p-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          Nothing selected. Please select a file to view
        </h1>
      </div>
    );
  }

  if (!dataURL) {
    <div className="h-full w-full relative overflow-hidden">
      <div className="text-gray-600 p-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    </div>;
  }

  return (
    <div className="h-full w-full relative overflow-hidden">
      {selectedFile && <Overlay filename={selectedFile?.filename} />}
      {dataURL && (
        <img
          src={dataURL}
          alt={selectedFile?.filename}
          className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 h-full w-full object-contain"
        />
      )}
    </div>
  );
};

export default Gallery;
