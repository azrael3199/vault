import { useContext, useEffect, useRef, useState } from "react";
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
    if (selectedFile) {
      const sidebarItemElement = document.getElementById(
        `sidebar-item-${selectedFile.id}`
      );
      if (sidebarItemElement) {
        sidebarItemElement.scrollIntoView({
          behavior: "auto",
          block: "center",
        });
      }
    }
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

  return (
    <div className="flex flex-col gap-1 overflow-y-auto scrollable-content">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl">Files</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-fit text-xs p-2 flex items-center gap-1"
            >
              <span className="text-gray-500">Sort by</span>
              {SORT_BY_MAP[sortBy] ?? sortBy}
              <ArrowUp
                className={clsx("w-4 h-4", {
                  "rotate-180": sortOrder === "desc",
                })}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2">
            <ul className="space-y-2">
              <li
                className={clsx("hover:bg-gray-900 p-2", {
                  "bg-gray-700": sortBy === "filename",
                })}
                onClick={() => {
                  setSortBy("filename");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Filename
              </li>
              <li
                className={clsx("hover:bg-gray-900 p-2", {
                  "bg-gray-700": sortBy === "uploadedAt",
                })}
                onClick={() => {
                  setSortBy("uploadedAt");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Uploaded At
              </li>
              <li
                className={clsx("hover:bg-gray-900 p-2", {
                  "bg-gray-700": sortBy === "size",
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
              <div className="mr-3">
                <Button
                  variant="outline"
                  className="h-fit p-2"
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
            <TooltipContent>
              <p>Upload a new file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {galleryFiles.length > 0 && (
        <div className="flex flex-col">
          <div className="py-2">
            <h2 className="text-md text-gray-600">Favorites</h2>
            <div className="flex h-full scrollable-content !overflow-y-auto flex-col gap-1 text-md text-gray-600">
              {galleryFiles
                .filter((file) => file.isFavorite)
                .map((file) => (
                  <div
                    id={`sidebar-item-${file.id}`}
                    key={file.id}
                    onClick={() => {
                      setSelectedFile(file);
                    }}
                  >
                    <SidebarItem
                      selected={file.id === selectedFile?.id}
                      icon={
                        <Image
                          className={clsx("w-5 h-5 text-gray-600 col-span-1", {
                            "text-gray-900": file.id === selectedFile?.id,
                          })}
                        />
                      }
                      itemName={file.filename}
                      itemDate={file.uploadedAt}
                      itemSize={file.size}
                      isFavorite={file.isFavorite}
                      isFavoriteHandler={() => toggleFavorite(file)}
                    />
                  </div>
                ))}
            </div>
          </div>
          <div className="py-2">
            <h2 className="text-md text-gray-600">Other Files</h2>
            <div
              id="sidebar"
              className="py-2 flex h-full scrollable-content !overflow-y-auto flex-col gap-1 text-md text-gray-600"
            >
              {galleryFiles
                .filter((file) => !file.isFavorite)
                .map((file) => (
                  <div
                    id={`sidebar-item-${file.id}`}
                    key={file.id}
                    onClick={() => {
                      setSelectedFile(file);
                    }}
                  >
                    <SidebarItem
                      selected={file.id === selectedFile?.id}
                      icon={
                        <Image
                          className={clsx("w-5 h-5 text-gray-600 col-span-1", {
                            "text-gray-900": file.id === selectedFile?.id,
                          })}
                        />
                      }
                      itemName={file.filename}
                      itemDate={file.uploadedAt}
                      itemSize={file.size}
                      isFavorite={file.isFavorite}
                      isFavoriteHandler={() => toggleFavorite(file)}
                    />
                  </div>
                ))}
              {itemsLoading ? (
                <div
                  id="loader"
                  className="flex items-center justify-center p-3"
                >
                  <LoadingSpinner />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      {galleryFiles.length === 0 && !itemsLoading ? (
        <div className="p-3 flex flex-col gap-2 overflow-y-auto text-md text-gray-600">
          <p>No files found</p>
        </div>
      ) : null}
    </div>
  );
};

export default FileSelectionMenu;
