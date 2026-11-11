import { Activity, Crown } from 'lucide-react';

export const Header = () => (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl text-heading">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-surface-strong/20 rounded-xl shadow-lg">
                    <Activity className="w-8 h-8 text-heading" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                        Master Accounts
                        <Crown className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
                    </h1>
                    <p className="text-purple-100 text-sm">
                        Manage your master trading accounts and view copier performance
                    </p>
                </div>
            </div>
        </div>
    </div>
);