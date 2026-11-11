import { User, Banknote, CreditCard } from 'lucide-react';
import { useProfileStore } from '@/Store/profile.store';

const navItems = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'account', label: 'Account Details', icon: Banknote },
    { id: 'wallet', label: 'Wallet Details', icon: CreditCard },
] as const;

export const Sidebar = () => {
    const { activeSection, setActiveSection } = useProfileStore();

    return (
        <aside className="lg:w-80 flex-shrink-0">
            <div className="client-theme-surface sticky top-6 rounded-2xl border border-border p-6 shadow-[0_18px_50px_rgba(2,6,23,0.3)]">
                <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-gradient-to-br from-accent to-accent-hover shadow-[0_18px_40px_rgba(14,165,233,0.24)]">
                        <User className="w-12 h-12 text-heading" />
                    </div>
                    <h1 className="text-3xl font-semibold text-heading">
                        Profile
                    </h1>
                    <p className="mt-1 text-sm text-subtle">Manage your information</p>
                </div>

                <nav className="space-y-2">
                    {navItems.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveSection(id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${activeSection === id
                                ? 'border border-accent/30 bg-accent/[0.14] text-accent shadow-[0_14px_32px_rgba(14,165,233,0.14)]'
                                : 'text-heading hover:bg-surface-strong/[0.06]'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
};
