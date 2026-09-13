import LoadingSpinner from "@/components/GlobalLoader/LoadingSpinner";
import Overlay from "@/components/Overlay/Overlay";
import { AppStateContext } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/ui/use-toast";
import { downloadFile } from "@/lib/apis/file";
import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sendMobileLog } from "@/lib/utils/logger";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Music, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { generateRetroIdenticon } from "@/lib/utils/identicon";

const Audio = () => {
  const navigate = useNavigate();
  const { selectedFile, setSelectedFile, galleryFiles, serverStatus, serverIp } =
    useContext(AppStateContext);
  const { toast } = useToast();

  const [dataURL, setDataURL] = useState("");
  const [identiconSrc, setIdenticonSrc] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const gradients = [
    "from-emerald-400 to-teal-500",
    "from-cyan-400 to-blue-500",
    "from-blue-400 to-indigo-500",
    "from-amber-400 to-orange-500",
    "from-rose-400 to-red-500",
    "from-cyan-400 to-blue-500",
  ];
  
  const currentGradient = selectedFile ? gradients[hashString(selectedFile.filename) % gradients.length] : gradients[0];

  useEffect(() => {
    let isMounted = true;
    let urlToRevoke = "";
    const abortController = new AbortController();

    const fetchCover = async () => {
      if (!selectedFile) {
        setIdenticonSrc("");
        return;
      }
      
      let newSrc = "";
      if (serverStatus === "connected" && serverIp) {
        try {
          const res = await fetch(`http://${serverIp}:5000/api/files/generate-cover?trackName=${encodeURIComponent(selectedFile.filename)}`, {
            signal: abortController.signal
          });
          if (res.ok) {
            const blob = await res.blob();
            newSrc = URL.createObjectURL(blob);
            urlToRevoke = newSrc;
          } else {
            newSrc = generateRetroIdenticon(selectedFile.filename);
          }
        } catch (e) {
          if ((e as Error).name !== 'AbortError') {
             newSrc = generateRetroIdenticon(selectedFile.filename);
          }
        }
      } else {
        newSrc = generateRetroIdenticon(selectedFile.filename);
      }
      
      if (isMounted && newSrc) setIdenticonSrc(newSrc);
    };

    fetchCover();

    return () => {
      isMounted = false;
      abortController.abort();
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [selectedFile, serverStatus, serverIp]);

  const fetchContent = async () => {
    if (selectedFile?.id && selectedFile?.type) {
      try {
        const res = await downloadFile(selectedFile.id, "audio");
        if (res.data.content) {
          // Use fetch to highly optimize base64 to Blob decoding off the main thread
          const fetchRes = await fetch(`data:${selectedFile.type};base64,${res.data.content}`);
          const blob = await fetchRes.blob();
          const url = URL.createObjectURL(blob);
          setDataURL(url);
        } else {
          throw new Error("Failed to fetch content");
        }
      } catch (error) {
        sendMobileLog(error as Error, "Audio_FetchContent");
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
    const currentIndex = galleryFiles.findIndex((file) => file.id === selectedFile?.id);
    if (currentIndex > 0) setSelectedFile(galleryFiles[currentIndex - 1]);
    else setSelectedFile(galleryFiles[galleryFiles.length - 1]);
  };

  const onNext = () => {
    const currentIndex = galleryFiles.findIndex((file) => file.id === selectedFile?.id);
    if (currentIndex < galleryFiles.length - 1) setSelectedFile(galleryFiles[currentIndex + 1]);
    else setSelectedFile(galleryFiles[0]);
  };

  const onDownload = async () => {
    if (!dataURL) await fetchContent();
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = selectedFile?.filename || `audio-${new Date().getTime()}.${selectedFile?.type?.split("/")[1] || "mp3"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (selectedFile?.id && selectedFile?.type) {
      if (!selectedFile.type.startsWith('audio/')) {
        setSelectedFile(null);
        return;
      }
      setIsPlaying(false);
      // Clean up previous blob URL
      if (dataURL) URL.revokeObjectURL(dataURL);
      setDataURL("");
      
      if (selectedFile.content) {
        setDataURL(selectedFile.content);
      } else {
        fetchContent();
      }
    }
    
    return () => {
       if (dataURL) URL.revokeObjectURL(dataURL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="h-full w-full relative overflow-hidden bg-black/5 dark:bg-black/20 rounded-2xl flex items-center justify-center animate-fade-in">
        <div className="absolute inset-0 bg-grid-black/5 dark:bg-grid-white/5 bg-[size:20px_20px] pointer-events-none" />
        <div className="z-10 p-10 rounded-[32px] glass-panel flex flex-col items-center justify-center gap-6 text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
            <Music className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {Capacitor.isNativePlatform() && (
                <Button onClick={() => navigate("/")} variant="ghost" size="icon" className="rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">
                Audio Vault
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Please select an audio file from the sidebar to play it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!dataURL) {
    return (
      <div className="h-full w-full relative overflow-hidden bg-black/5 dark:bg-black/40 rounded-2xl flex items-center justify-center animate-fade-in">
        <LoadingSpinner className="w-12 h-12 text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-hidden bg-black/5 dark:bg-black/60 rounded-2xl shadow-inner group flex flex-col items-center justify-center animate-fade-in transition-colors duration-500">
      <div className="absolute inset-0 bg-grid-black/5 dark:bg-grid-white/5 bg-[size:20px_20px] pointer-events-none opacity-50" />
      
      {dataURL && (
        <div className="z-10 flex flex-col items-center justify-center gap-8 md:gap-12 w-full max-w-md px-6">
          {identiconSrc ? (
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl overflow-hidden relative border border-white/10 dark:border-white/5 group bg-black/20">
              <img src={identiconSrc} alt="Cover Art" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 shadow-inner rounded-2xl pointer-events-none" />
            </div>
          ) : (
            <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-gray-900 to-black shadow-2xl flex items-center justify-center relative ${isPlaying ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '4s' }}>
              <div className="absolute inset-2 rounded-full border-4 border-gray-800" />
              <div className="absolute inset-6 rounded-full border border-gray-800" />
              <div className="absolute inset-10 rounded-full border border-gray-800" />
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-inner overflow-hidden border-4 border-gray-900 relative">
                 <div className={`w-full h-full bg-gradient-to-br ${currentGradient} flex items-center justify-center`}>
                    <div className="w-4 h-4 bg-black rounded-full shadow-inner" />
                 </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center gap-6 w-full mt-4">
            <div className="text-center w-full px-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground truncate">{selectedFile.filename}</h2>
              <p className="text-sm text-muted-foreground mt-1 uppercase tracking-widest">{selectedFile.type}</p>
            </div>
            
            <audio 
              ref={audioRef}
              src={dataURL} 
              autoPlay 
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => { setIsPlaying(false); onNext(); }}
              className="hidden" 
            />

            <div className="w-full bg-black/10 dark:bg-black/30 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-5">
              <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground font-mono">
                <span className="w-10 text-right">{formatTime(currentTime)}</span>
                <input 
                  type="range" 
                  min={0} 
                  max={duration || 100} 
                  value={currentTime} 
                  onChange={handleSeek}
                  className="flex-1 h-2 rounded-full appearance-none bg-white/10 accent-emerald-500 cursor-pointer"
                />
                <span className="w-10 text-left">{formatTime(duration)}</span>
              </div>
              
              <div className="flex items-center justify-center gap-6">
                <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/10 text-foreground transition-all" onClick={onPrev}>
                  <SkipBack className="w-5 h-5 fill-current" />
                </Button>
                
                <Button variant="default" size="icon" className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentGradient} hover:scale-105 transition-transform shadow-lg text-black hover:opacity-90`} onClick={togglePlay}>
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
                </Button>
                
                <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/10 text-foreground transition-all" onClick={onNext}>
                  <SkipForward className="w-5 h-5 fill-current" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <Overlay
            filename={selectedFile?.filename}
            onDownload={onDownload}
            isInteractive={false}
            toggleInteractive={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default Audio;
