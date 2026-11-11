import { CheckCircle } from 'lucide-react';

interface UploadProgressProps {
    progress: number;
}

export const UploadProgress = ({ progress }: UploadProgressProps) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-body">Uploading...</span>
                <span className="font-medium text-blue-600">{progress}%</span>
            </div>

            <div className="w-full bg-surface-strong rounded-full h-2 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {progress === 100 && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Processing document...</span>
                </div>
            )}
        </div>
    );
};