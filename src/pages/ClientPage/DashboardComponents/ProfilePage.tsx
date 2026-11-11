import { useProfileStore } from "@/Store/profile.store";
import { DocumentUploadManager } from "@/components/ProfilePage/documents/DocumentUploadManager";
import { AccountDetails } from "@/components/ProfilePage/profile/AccountDetails";
import { LoadingState } from "@/components/ProfilePage/profile/LoadingState";
import { PersonalInfo } from "@/components/ProfilePage/profile/PersonalInfo";
import { Sidebar } from "@/components/ProfilePage/profile/Sidebar";
import { WalletDetails } from "@/components/ProfilePage/profile/WalletDetails";
import { useProfile } from "@/hooks/useProfileQueries";
import { useEffect } from "react";

export default function ProfilePage() {
  const { activeSection, initializeFromProfile } = useProfileStore();
  const { data: profile, isLoading, error } = useProfile();
  // Initialize store with profile data
  useEffect(() => {
    if (profile) {
      initializeFromProfile(profile);
    }
  }, [profile, initializeFromProfile]);

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <div className="client-theme-bg flex h-screen w-full items-center justify-center text-rose-700 dark:text-rose-300">
        Error loading profile. Please try again.
      </div>
    );
  }

  return (
    <div className="client-theme-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />

          <main className="client-theme-surface-strong flex-1 rounded-2xl border border-border shadow-[0_18px_50px_rgba(2,6,23,0.35)]">
            <div className="p-6 lg:p-8">
              {activeSection === "personal" && (
                <div className="space-y-6">
                  <PersonalInfo personalInfo={profile?.personalInfo} />
                  <DocumentUploadManager profile={profile} />
                </div>
              )}

              {activeSection === "account" && <AccountDetails />}

              {activeSection === "wallet" && <WalletDetails />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
