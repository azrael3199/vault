import LoadingSpinner from "@/components/GlobalLoader/LoadingSpinner";
import Overlay from "@/components/Overlay/Overlay";
import { AppStateContext } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/ui/use-toast";
import { downloadFile } from "@/lib/apis/file";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendMobileLog } from "@/lib/utils/logger";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { createPortal } from "react-dom";

const Gallery = () => {
  const navigate = useNavigate();
  const { selectedFile, setSelectedFile, galleryFiles } =
    useContext(AppStateContext);
  const { toast } = useToast();

  const [dataURL, setDataURL] = useState("");
  const [isInteractive, setIsInteractive] = useState(false);

  const fetchContent = async () => {
    if (selectedFile?.id && selectedFile?.type) {
      try {
        const res = await downloadFile(selectedFile.id, "image");
        console.log(res);
        if (res.data.content) {
          // Use fetch to highly optimize base64 to Blob decoding off the main thread
          const fetchRes = await fetch(`data:${selectedFile.type};base64,${res.data.content}`);
          const blob = await fetchRes.blob();
          setDataURL(URL.createObjectURL(blob));
        } else {
          throw new Error("Failed to fetch content");
        }
      } catch (error) {
        sendMobileLog(error as Error, "Gallery_FetchContent");
        toast({
          variant: "destructive",
          title: "Error",
          description: (error as Error).message,
        });
        console.log(error);
        setSelectedFile(null);
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
      if (!selectedFile.type.startsWith('image/')) {
        setSelectedFile(null);
        return;
      }
      setIsInteractive(false); // Reset interactive state on file change
      
      // Clean up previous blob URL
      if (dataURL && dataURL.startsWith('blob:')) {
        URL.revokeObjectURL(dataURL);
      }
      setDataURL("");
      
      if (selectedFile.content) {
        setDataURL(selectedFile.content);
      } else {
        fetchContent();
      }
    }

    return () => {
      if (dataURL && dataURL.startsWith('blob:')) {
        URL.revokeObjectURL(dataURL);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="h-full w-full relative overflow-hidden bg-black/5 dark:bg-black/20 rounded-2xl flex items-center justify-center animate-fade-in">
        <div className="absolute inset-0 bg-grid-black/5 dark:bg-grid-white/5 bg-[size:20px_20px] pointer-events-none" />
        <div className="z-10 p-10 rounded-[32px] glass-panel flex flex-col items-center justify-center gap-6 text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {Capacitor.isNativePlatform() && (
                <Button
                  onClick={() => navigate("/")}
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                Gallery
              </h1>
            </div>
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
        <LoadingSpinner className="w-12 h-12 text-cyan-500" />
      </div>
    );
  }

  const interactiveView = (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fade-in">
      {dataURL && (
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={5}
          centerOnInit
          wheel={{ step: 0.1 }}
        >
          <TransformComponent wrapperClass="w-screen h-screen" contentClass="flex items-center justify-center min-w-[100vw] min-h-[100vh]">
            <img
              src={dataURL}
              alt={selectedFile?.filename}
              className="max-w-[100vw] max-h-[100vh] object-contain"
            />
          </TransformComponent>
        </TransformWrapper>
      )}

      {selectedFile && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <Overlay
            filename={selectedFile?.filename}
            onPrev={onPrev}
            onNext={onNext}
            onDownload={onDownload}
            isInteractive={isInteractive}
            toggleInteractive={() => setIsInteractive(!isInteractive)}
          />
        </div>
      )}
    </div>
  );

  if (isInteractive) {
    return createPortal(interactiveView, document.body);
  }

  return (
    <div className="h-full w-full bg-black/5 dark:bg-black/60 rounded-2xl shadow-inner relative overflow-hidden group flex items-center justify-center animate-fade-in transition-colors duration-500">
      <div className="absolute inset-0 bg-grid-black/5 dark:bg-grid-white/5 bg-[size:20px_20px] pointer-events-none opacity-50" />
      
      {dataURL && (
        <img
          src={dataURL}
          alt={selectedFile?.filename}
          className="z-0 max-h-[90%] max-w-[90%] object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
        />
      )}

      {selectedFile && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <Overlay
            filename={selectedFile?.filename}
            onPrev={onPrev}
            onNext={onNext}
            onDownload={onDownload}
            isInteractive={isInteractive}
            toggleInteractive={() => setIsInteractive(!isInteractive)}
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;

