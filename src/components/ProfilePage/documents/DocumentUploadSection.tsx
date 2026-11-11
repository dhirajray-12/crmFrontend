import { useDocumentStore, type DocumentType } from '@/Store/document.store';
import { useToastStore } from '@/Store/toast.store';
import { DocumentDropzone } from '@/components/ProfilePage/documents/DocumentDropzone';
import { DocumentPreview } from '@/components/ProfilePage/documents/DocumentPreview';
import { UploadProgress } from '@/components/ProfilePage/documents/UploadProgress';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentUploadSectionProps {
    type: DocumentType;
    label: string;
    description: string;
    accept: string;
    maxSize?: number; // in MB
}

export const DocumentUploadSection = ({
    type,
    label,
    description,
    accept,
    maxSize = 10, // Default 10MB
}: DocumentUploadSectionProps) => {
    const { documents, setDocumentFile, clearDocument } = useDocumentStore();
    const addToast = useToastStore((state) => state.addToast);
    const doc = documents[type];

    const handleFileSelect = (file: File) => {
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
            addToast('error', `File size should be less than ${maxSize}MB.`);
            return;
        }

        // Validate file type
        const acceptedTypes = accept.split(',');
        const fileType = file.type;
        const isValidType = acceptedTypes.some(type => {
            if (type.includes('/*')) {
                const mainType = type.split('/')[0];
                return fileType.startsWith(mainType);
            }
            return type === fileType || type === `.${file.name.split('.').pop()}`;
        });

        if (!isValidType && accept !== '*') {
            addToast('error', 'Invalid file type.');
            return;
        }

        setDocumentFile(type, file);
    };

    const handleClear = () => {
        clearDocument(type);
    };

    return (
        <div className="rounded-2xl border border-border bg-surface-strong/[0.04] p-5 transition-all hover:bg-surface-strong/[0.05]">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-bold text-heading">
                        {label}
                        {doc.uploaded && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/[0.12] px-2 py-1 text-xs text-emerald-700 dark:text-emerald-200">
                                <CheckCircle className="w-3 h-3" />
                                Uploaded
                            </span>
                        )}
                        {doc.error && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/[0.12] px-2 py-1 text-xs text-rose-700 dark:text-rose-200">
                                <AlertCircle className="w-3 h-3" />
                                Failed
                            </span>
                        )}
                    </label>
                    <p className="text-xs text-subtle">{description}</p>
                    <p className="mt-1 text-xs text-subtle">Max size: {maxSize}MB</p>
                </div>
            </div>

            {!doc.file && !doc.uploaded && (
                <DocumentDropzone
                    onFileSelect={handleFileSelect}
                    accept={accept}
                    label={label}
                />
            )}

            {doc.file && !doc.uploaded && (
                <div className="space-y-3">
                    <DocumentPreview
                        file={doc.file}
                        previewUrl={doc.previewUrl}
                        fileType={doc.fileType}
                        fileName={doc.fileName}
                        fileSize={doc.fileSize}
                        onClear={handleClear}
                    />
                    {doc.uploadProgress > 0 && doc.uploadProgress < 100 && (
                        <UploadProgress progress={doc.uploadProgress} />
                    )}
                </div>
            )}

            {doc.uploaded && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08] p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <p className="text-sm font-medium text-emerald-100">Uploaded Successfully</p>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">{doc.fileName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        className="text-xs text-rose-700 dark:text-rose-300 transition-colors hover:text-rose-200"
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
};
