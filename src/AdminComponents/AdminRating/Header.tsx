import { Award } from 'lucide-react';

export const Header = () => (
    <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 shadow-xl text-heading">
            <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 text-yellow-700 dark:text-yellow-300" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    Master Traders Rating
                </h1>
            </div>
            <p className="text-purple-100 ml-11">
                Choose from our top-performing copy trading masters
            </p>
        </div>
    </div>
);