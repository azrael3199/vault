import { useContext, useEffect, useRef, useState } from "react";
import { AppStateContext, File } from "../providers/AppStateProvider";
import LoadingSpinner from "../GlobalLoader/LoadingSpinner";
import { getAllFilesOfType, uploadFiles } from "@/lib/apis/file";
import { useToast } from "../ui/use-toast";
import { Image, Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SidebarItem from "./SidebarItem";
import clsx from "clsx";

const FileSelectionMenu = () => {
  const { galleryFiles, selectedFile, setGalleryFiles, setSelectedFile } =
    useContext(AppStateContext);
  const [itemsLoading, setItemsLoading] = useState(false);

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
            };
          })
          .sort((a: File, b: File) => {
            return (
              new Date(b.uploadedAt).getTime() -
              new Date(a.uploadedAt).getTime()
            );
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

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl">Files</h1>
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
        <div
          id="sidebar"
          className="py-2 flex h-full scrollable-content !overflow-y-auto flex-col gap-1 text-md text-gray-600"
        >
          {galleryFiles.map((file) => (
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
              />
            </div>
          ))}
          {itemsLoading ? (
            <div id="loader" className="flex items-center justify-center p-3">
              <LoadingSpinner />
            </div>
          ) : null}
        </div>
      )}
      {galleryFiles.length === 0 && !itemsLoading ? (
        <div className="p-3 flex flex-col gap-2 overflow-y-auto text-md text-gray-600">
          <p>No files found</p>
        </div>
      ) : null}
    </>
  );
};

export default FileSelectionMenu;
