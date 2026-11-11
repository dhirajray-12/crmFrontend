import { RefreshCw } from 'lucide-react';

export const AuthLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
            <RefreshCw className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
            <p className="text-body">Checking authentication...</p>
        </div>
    </div>
);