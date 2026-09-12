import LoadingSpinner from "@/components/GlobalLoader/LoadingSpinner";
import Overlay from "@/components/Overlay/Overlay";
import { AppStateContext } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/ui/use-toast";
import { downloadFile } from "@/lib/apis/file";
import { useContext, useEffect, useState } from "react";

const Gallery = () => {
  const { selectedFile, setSelectedFile, galleryFiles } =
    useContext(AppStateContext);
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

  const onPrev = () => {
    const currentIndex = galleryFiles.findIndex(
      (file) => file.id === selectedFile?.id
    );
    if (currentIndex > 0) {
      setSelectedFile(galleryFiles[currentIndex - 1]);
    } else {
      setSelectedFile(galleryFiles[galleryFiles.length - 1]);
    }
  };

  const onNext = () => {
    const currentIndex = galleryFiles.findIndex(
      (file) => file.id === selectedFile?.id
    );
    if (currentIndex < galleryFiles.length - 1) {
      setSelectedFile(galleryFiles[currentIndex + 1]);
    } else {
      setSelectedFile(galleryFiles[0]);
    }
  };

  const onDownload = async () => {
    if (!dataURL) {
      await fetchContent();
    }
    const link = document.createElement("a");
    link.href = dataURL;
    link.download =
      selectedFile?.filename ||
      `image-${new Date().getTime()}.${selectedFile?.type || ""}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="h-full w-full relative overflow-hidden bg-black/5 dark:bg-black/20 rounded-2xl flex items-center justify-center animate-fade-in">
        <div className="absolute inset-0 bg-grid-black/5 dark:bg-grid-white/5 bg-[size:20px_20px] pointer-events-none" />
        <div className="z-10 p-10 rounded-[32px] glass-panel flex flex-col items-center justify-center gap-6 text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              No File Selected
            </h1>
            <p className="text-muted-foreground text-sm">
              Please select an image from the sidebar to view it in theater mode.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!dataURL) {
    return (
      <div className="h-full w-full relative overflow-hidden bg-black/5 dark:bg-black/40 rounded-2xl flex items-center justify-center animate-fade-in">
        <LoadingSpinner className="w-12 h-12 text-purple-500" />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-hidden bg-black/5 dark:bg-black/60 rounded-2xl shadow-inner group flex items-center justify-center animate-fade-in transition-colors duration-500">
      <div className="absolute inset-0 bg-grid-black/5 dark:bg-grid-white/5 bg-[size:20px_20px] pointer-events-none opacity-50" />
      
      {selectedFile && (
        <Overlay
          filename={selectedFile?.filename}
          onPrev={onPrev}
          onNext={onNext}
          onDownload={onDownload}
        />
      )}
      
      {dataURL && (
        <img
          src={dataURL}
          alt={selectedFile?.filename}
          className="z-0 max-h-[90%] max-w-[90%] object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
        />
      )}
    </div>
  );
};

export default Gallery;
