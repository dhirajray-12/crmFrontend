import { User } from 'lucide-react';

interface PersonalInfoProps {
    personalInfo?: {
        firstName?: string;
        lastName?: string;
        dateofbirth?: string;
        phone?: string;
        email?: string;
    };
}

export const PersonalInfo = ({ personalInfo }: PersonalInfoProps) => {
    return (
        <>
            <div className="flex items-center gap-3 border-b border-border pb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.14] shadow-[0_12px_30px_rgba(14,165,233,0.18)]">
                    <User className="w-6 h-6 text-heading" />
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-heading">Personal Information</h2>
                    <p className="mt-1 text-sm text-subtle">Your verified client identity details.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="First Name" value={personalInfo?.firstName || ''} />
                <InfoField label="Last Name" value={personalInfo?.lastName || ''} />
                <InfoField
                    label="Date of Birth"
                    value={personalInfo?.dateofbirth ? personalInfo.dateofbirth.split('T')[0] : ''}
                />
                <InfoField label="Contact Number" value={personalInfo?.phone || ''} />
                <InfoField label="Email Address" value={personalInfo?.email || ''} className="md:col-span-2" />
            </div>
        </>
    );
};

const InfoField = ({ label, value, className = '' }: { label: string; value: string; className?: string }) => (
    <div className={className}>
        <label className="mb-2 block text-sm font-semibold text-heading">{label}</label>
        <input
            type="text"
            value={value}
            readOnly
            className="client-theme-input w-full rounded-xl px-4 py-3 text-heading"
        />
    </div>
);
