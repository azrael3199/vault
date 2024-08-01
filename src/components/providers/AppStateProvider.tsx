import { createContext, Dispatch, SetStateAction, useState } from "react";
import { Toaster } from "../ui/toaster";
import GlobalLoader from "../GlobalLoader/GlobalLoader";

export type File = {
  id: string;
  filename: string;
  uploadedAt: string;
  content: string | null;
  type: string;
  size: number;
};

interface AppState {
  galleryFiles: File[];
  selectedFile: File | null;
  loading: string | null;
  setGalleryFiles: Dispatch<SetStateAction<File[]>>;
  setSelectedFile: Dispatch<SetStateAction<File | null>>;
  updateFileContent: (id: string, content: string) => void;
  setLoading: Dispatch<SetStateAction<string | null>>;
}

export const AppStateContext = createContext<AppState>({
  galleryFiles: [],
  selectedFile: null,
  loading: null,
  setGalleryFiles: () => null,
  setSelectedFile: () => null,
  updateFileContent: () => null,
  setLoading: () => null,
});

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const updateFileContent = (id: string, content: string) => {
    const index = galleryFiles.findIndex((file) => file.id === id);
    if (index !== -1) {
      galleryFiles[index].content = content;
      setGalleryFiles([...galleryFiles]);
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        galleryFiles,
        selectedFile,
        loading,
        setGalleryFiles,
        setSelectedFile,
        updateFileContent,
        setLoading,
      }}
    >
      {children}
      <GlobalLoader message={loading} />
      <Toaster />
    </AppStateContext.Provider>
  );
};
