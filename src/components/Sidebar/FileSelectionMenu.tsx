import { useContext, useEffect, useRef, useState, useMemo } from "react";
import { AppStateContext, File } from "../providers/AppStateProvider";
import LoadingSpinner from "../GlobalLoader/LoadingSpinner";
import {
  getAllFilesOfType,
  uploadFiles,
  favoriteFile,
  unfavoriteFile,
} from "@/lib/apis/file";
import { useToast } from "../ui/use-toast";
import { ArrowUp, Image, Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SidebarItem from "./SidebarItem";
import clsx from "clsx";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Virtuoso } from "react-virtuoso";

interface AutoSizedListProps {
  items: File[];
  selectedFile: File | null;
  setSelectedFile: (file: File) => void;
  toggleFavorite: (file: File) => void;
}

const AutoSizedList = ({ items, selectedFile, setSelectedFile, toggleFavorite }: AutoSizedListProps) => {
  return (
    <div className="w-full h-full flex-1">
      <Virtuoso
        className="[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300/80 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/80 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full pr-1"
        style={{ height: '100%', width: '100%' }}
        data={items}
        itemContent={(index, file) => (
          <div
            id={`sidebar-item-${file.id}`}
            onClick={() => setSelectedFile(file)}
            className="pb-[2px]"
          >
            <div className="h-8">
              <SidebarItem
                selected={file.id === selectedFile?.id}
                icon={
                  <Image
                    className={clsx("w-4 h-4 text-gray-400 transition-colors", {
                      "text-purple-600 dark:text-purple-400": file.id === selectedFile?.id,
                    })}
                  />
                }
                itemName={file.filename}
                itemDate={file.uploadedAt}
                itemSize={file.size}
                isFavorite={file.isFavorite}
                isFavoriteHandler={(e) => {
                  e.stopPropagation();
                  toggleFavorite(file);
                }}
              />
            </div>
          </div>
        )}
      />
    </div>
  );
};

const SORT_BY_MAP = {
  filename: "Name",
  uploadedAt: "Date",
  size: "Size",
};

const FileSelectionMenu = () => {
  const { galleryFiles, selectedFile, setGalleryFiles, setSelectedFile } =
    useContext(AppStateContext);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"filename" | "uploadedAt" | "size">(
    "uploadedAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Fetch files
  const fetchFiles = async () => {
    setItemsLoading(true);
    try {
      const res = await getAllFilesOfType("image");
      if (res && res.data) {
        const newFiles = res.data
          .map((file: File) => {
            return {
              id: file.id,
              filename: file.filename,
              uploadedAt: file.uploadedAt,
              content: null,
              type: file.type,
              size: file.size,
              isFavorite: file.isFavorite,
            };
          })
          .sort((a: File, b: File) => {
            const multiplier = sortOrder === "asc" ? 1 : -1;
            switch (sortBy) {
              case "filename":
                return a.filename.localeCompare(b.filename) * multiplier;
              case "uploadedAt":
                return (
                  (new Date(b.uploadedAt).getTime() -
                    new Date(a.uploadedAt).getTime()) *
                  multiplier
                );
              case "size":
                return (a.size - b.size) * multiplier;
            }
          });
        setGalleryFiles(newFiles);
      } else {
        setGalleryFiles([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch files",
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
      setItemsLoading(false);
    }
  };

  // Upload handler
  const filesUploadHandler = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      setItemsLoading(true);
      try {
        const loader = document.getElementById("loader");
        if (loader) {
          loader.scrollTop = 0;
        }
        const uploadRes = await uploadFiles(files);
        if (!uploadRes || !uploadRes.data) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to upload files",
          });
          return;
        }
        fetchFiles();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: (error as Error).message,
        });
        console.log(error);
      } finally {
        setItemsLoading(false);
      }
    }
  };

  const toggleFavorite = async (file: File) => {
    const apiToCall = file.isFavorite ? unfavoriteFile : favoriteFile;
    try {
      const updatedFile = (await apiToCall(file.id)).data;
      setGalleryFiles((prevFiles) =>
        prevFiles.map((f) => (f.id === file.id ? updatedFile : f))
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorite status",
      });
      console.log(error);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Intentionally removed auto-scroll because standard DOM scrollIntoView conflicts with react-virtuoso
    // and causes unintended full-page layout shifts.
  }, [selectedFile]);

  useEffect(() => {
    const oldFiles = [...galleryFiles];
    const newFiles = oldFiles.sort((a: File, b: File) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      switch (sortBy) {
        case "filename":
          return a.filename.localeCompare(b.filename) * multiplier;
        case "uploadedAt":
          return (
            (new Date(b.uploadedAt).getTime() -
              new Date(a.uploadedAt).getTime()) *
            multiplier
          );
        case "size":
          return (a.size - b.size) * multiplier;
      }
    });

    setGalleryFiles(newFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  const favorites = useMemo(() => galleryFiles.filter((f) => f.isFavorite), [galleryFiles]);
  const others = useMemo(() => galleryFiles.filter((f) => !f.isFavorite), [galleryFiles]);

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden bg-transparent">
      <div className="flex items-center justify-between gap-3 px-2">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Files</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-fit text-xs px-3 py-1.5 flex items-center gap-1 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm hover:shadow-md transition-all rounded-full"
            >
              <span className="text-muted-foreground font-medium">Sort by</span>
              <span className="font-semibold">{SORT_BY_MAP[sortBy] ?? sortBy}</span>
              <ArrowUp
                className={clsx("w-3.5 h-3.5 ml-1 text-purple-500", {
                  "rotate-180": sortOrder === "desc",
                })}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 w-48 rounded-xl glass-panel border-purple-500/20">
            <ul className="space-y-1">
              <li
                className={clsx("p-2 rounded-lg cursor-pointer transition-all hover:bg-purple-500/10 font-medium text-sm", {
                  "bg-purple-500/20 text-purple-700 dark:text-purple-300": sortBy === "filename",
                })}
                onClick={() => {
                  setSortBy("filename");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Filename
              </li>
              <li
                className={clsx("p-2 rounded-lg cursor-pointer transition-all hover:bg-purple-500/10 font-medium text-sm", {
                  "bg-purple-500/20 text-purple-700 dark:text-purple-300": sortBy === "uploadedAt",
                })}
                onClick={() => {
                  setSortBy("uploadedAt");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Uploaded At
              </li>
              <li
                className={clsx("p-2 rounded-lg cursor-pointer transition-all hover:bg-purple-500/10 font-medium text-sm", {
                  "bg-purple-500/20 text-purple-700 dark:text-purple-300": sortBy === "size",
                })}
                onClick={() => {
                  setSortBy("size");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Size
              </li>
            </ul>
          </PopoverContent>
        </Popover>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mr-1">
                <Button
                  className="h-fit p-2 bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all rounded-full border-0"
                  onClick={() => {
                    fileInputRef?.current?.click();
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={filesUploadHandler}
                  style={{ display: "none" }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent className="rounded-xl glass-panel">
              <p>Upload new files</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {galleryFiles.length > 0 && (
        <div className="flex flex-col h-full overflow-hidden flex-1 gap-5 mt-1">
          {favorites.length > 0 && (
            <div className="flex flex-col flex-1 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl p-2 border border-white/10 shadow-inner relative overflow-hidden">
              <div className="sticky top-0 bg-transparent z-10 p-2 pb-1 backdrop-blur-xl">
                <h2 className="text-[10px] uppercase tracking-widest font-extrabold text-purple-500/80 dark:text-purple-400/80 px-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Favorites
                </h2>
              </div>
              <AutoSizedList items={favorites} selectedFile={selectedFile} setSelectedFile={setSelectedFile} toggleFavorite={toggleFavorite} />
            </div>
          )}
          {others.length > 0 && (
            <div className="flex flex-col flex-1 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl p-2 border border-white/10 shadow-inner relative overflow-hidden">
               <div className="sticky top-0 bg-transparent z-10 p-2 pb-1 backdrop-blur-xl">
                <h2 className="text-[10px] uppercase tracking-widest font-extrabold text-purple-500/80 dark:text-purple-400/80 px-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> All Files
                </h2>
              </div>
              <AutoSizedList items={others} selectedFile={selectedFile} setSelectedFile={setSelectedFile} toggleFavorite={toggleFavorite} />
              {itemsLoading && (
                <div id="loader" className="flex items-center justify-center p-3 absolute bottom-0 left-0 right-0 bg-background/50 backdrop-blur-md z-10">
                  <LoadingSpinner className="text-purple-500 w-6 h-6" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {galleryFiles.length === 0 && !itemsLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
             <Image className="w-5 h-5 text-purple-500/50" />
          </div>
          <p className="text-sm font-medium">Your vault is empty</p>
        </div>
      ) : null}
    </div>
  );
};

export default FileSelectionMenu;
