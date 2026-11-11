import { create } from "zustand";

export interface DocumentFile {
  file: File | null;
  uploaded: boolean;
  previewUrl: string | null;
  uploadProgress: number;
  error: string | null;
  fileType: string | null;
  fileName: string | null;
  fileSize: number | null;
}

export interface Documents {
  idProof: DocumentFile;
  kycSelfie: DocumentFile;
  addressProof: DocumentFile;
}

export type DocumentType = keyof Documents;

interface DocumentStore {
  // State
  documents: Documents;
  isUploading: boolean;
  overallProgress: number;

  // Actions
  setDocumentFile: (type: DocumentType, file: File | null) => void;
  setDocumentUploaded: (type: DocumentType, uploaded: boolean) => void;
  setUploadProgress: (type: DocumentType, progress: number) => void;
  setDocumentError: (type: DocumentType, error: string | null) => void;
  clearDocument: (type: DocumentType) => void;
  clearAllDocuments: () => void;
  setIsUploading: (isUploading: boolean) => void;
  updateOverallProgress: () => void;
}

const initialDocumentState: DocumentFile = {
  file: null,
  uploaded: false,
  previewUrl: null,
  uploadProgress: 0,
  error: null,
  fileType: null,
  fileName: null,
  fileSize: null,
};

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: {
    idProof: { ...initialDocumentState },
    kycSelfie: { ...initialDocumentState },
    addressProof: { ...initialDocumentState },
  },
  isUploading: false,
  overallProgress: 0,

  setDocumentFile: (type, file) => {
    // Clean up old preview URL if exists
    const currentDoc = get().documents[type];
    if (currentDoc.previewUrl) {
      URL.revokeObjectURL(currentDoc.previewUrl);
    }

    let previewUrl = null;
    let fileType = null;
    let fileName = null;
    let fileSize = null;

    if (file) {
      previewUrl = URL.createObjectURL(file);
      fileType = file.type;
      fileName = file.name;
      fileSize = file.size;
    }

    set((state) => ({
      documents: {
        ...state.documents,
        [type]: {
          ...initialDocumentState,
          file,
          previewUrl,
          fileType,
          fileName,
          fileSize,
        },
      },
    }));

    get().updateOverallProgress();
  },

  setDocumentUploaded: (type, uploaded) =>
    set((state) => ({
      documents: {
        ...state.documents,
        [type]: {
          ...state.documents[type],
          uploaded,
          uploadProgress: uploaded ? 100 : 0,
        },
      },
    })),

  setUploadProgress: (type, progress) =>
    set((state) => ({
      documents: {
        ...state.documents,
        [type]: { ...state.documents[type], uploadProgress: progress },
      },
    })),

  setDocumentError: (type, error) =>
    set((state) => ({
      documents: {
        ...state.documents,
        [type]: { ...state.documents[type], error },
      },
    })),

  clearDocument: (type) => {
    const doc = get().documents[type];
    if (doc.previewUrl) {
      URL.revokeObjectURL(doc.previewUrl);
    }

    set((state) => ({
      documents: {
        ...state.documents,
        [type]: { ...initialDocumentState },
      },
    }));

    get().updateOverallProgress();
  },

  clearAllDocuments: () => {
    const { documents } = get();
    Object.values(documents).forEach((doc) => {
      if (doc.previewUrl) {
        URL.revokeObjectURL(doc.previewUrl);
      }
    });

    set({
      documents: {
        idProof: { ...initialDocumentState },
        kycSelfie: { ...initialDocumentState },
        addressProof: { ...initialDocumentState },
      },
    });

    get().updateOverallProgress();
  },

  setIsUploading: (isUploading) => set({ isUploading }),

  updateOverallProgress: () => {
    const { documents } = get();
    const docs = Object.values(documents);
    const total = docs.length;
    const uploaded = docs.filter((doc) => doc.uploaded).length;
    const overallProgress = (uploaded / total) * 100;
    set({ overallProgress });
  },
}));
