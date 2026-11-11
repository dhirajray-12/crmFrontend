import { useState } from "react";
import { Activity, Award, Sparkles, Users } from "lucide-react";
import { useMasters } from "@/hooks/useMasters";
import { useFilters } from "@/hooks/useFilters";
import { MasterCard } from "@/components/Rating/MasterCard/MasterCard";
import { MasterDetails } from "@/components/Rating/MasterDetails/MasterDetails";
import { FilterPanel } from "@/components/Rating/FilterPanel/FilterPanel";
import { SearchBar } from "@/components/Rating/SearchBar/SearchBar";
import { SetupCopyingModal } from "@/components/Rating/SetupCopyingModal/SetupCopyingModal";
import { LoadingSpinner } from "@/components/Rating/common/LoadingSpinner";
import { ErrorDisplay } from "@/components/Rating/common/ErrorDisplay";
import { useToastStore } from "@/Store/toast.store";

const CopyTradingRating = () => {
  const { masters, selectedMaster, setSelectedMaster, loading, error, fetchMasterDetails, fetchMasters } =
    useMasters();
  const { filteredMasters, searchQuery, setSearchQuery, filters, setFilters, resetFilters, applyFilters } =
    useFilters(masters);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const handleMasterClick = (masterId: string) => {
    fetchMasterDetails(masterId);
  };

  const handleSuccess = () => {
    addToast(
      "success",
      `Copy trading started for ${selectedMaster?.name ?? "this master"} successfully.`,
    );
    fetchMasters();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !masters.length) {
    return <ErrorDisplay message={error} />;
  }

  const statCards = [
    {
      title: "Masters",
      value: masters.length,
      icon: <Users className="h-4 w-4 text-accent" />,
      accentColor: "bg-accent",
    },
    {
      title: "Visible",
      value: filteredMasters.length,
      icon: <Activity className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />,
      accentColor: "bg-emerald-400",
    },
    {
      title: "Mode",
      value: "Ranked feed",
      icon: <Sparkles className="h-4 w-4 text-amber-700 dark:text-amber-300" />,
      accentColor: "bg-amber-400",
    },
  ];

  return (
    <div className="client-theme-bg min-h-screen p-3 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        {!selectedMaster ? (
          <>
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6">
              <div className="absolute inset-y-0 left-0 w-1 bg-amber-400" />
              <div className="pl-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                  <Award className="h-3.5 w-3.5" />
                  Copy Trading Rating
                </div>
                <h1 className="mt-3 text-xl font-bold text-heading sm:text-2xl">
                  Master Traders Rating
                </h1>
                <p className="mt-1 max-w-xl text-sm text-subtle">
                  Scan proven masters, compare risk posture, and move from discovery to copy setup.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {statCards.map((card, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5"
                >
                  <div className={`absolute inset-y-0 left-0 w-1 ${card.accentColor}`} />
                  <div className="flex items-center justify-between gap-2 pl-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                      {card.title}
                    </span>
                    {card.icon}
                  </div>
                  <p className="mt-3 truncate pl-2 text-2xl font-bold text-heading sm:text-[28px]">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-heading">Discover and filter masters</h2>
                <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                  {filteredMasters.length} results
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search by name or account..."
                  />
                </div>
                <FilterPanel
                  filters={filters}
                  setFilters={setFilters}
                  onApply={applyFilters}
                  onReset={resetFilters}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-subtle">
                Showing <span className="font-semibold text-heading">{filteredMasters.length}</span> of{" "}
                <span className="font-semibold text-heading">{masters.length}</span> masters
              </p>
            </div>

            {filteredMasters.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-10 text-center">
                <p className="mb-1 text-base font-semibold text-heading">No masters found</p>
                <p className="text-sm text-subtle">Adjust your filters and run the board again.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredMasters.map((master, index) => (
                  <MasterCard
                    key={master.id}
                    master={master}
                    onClick={() => handleMasterClick(master.id)}
                    rank={index + 1}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <MasterDetails
            master={selectedMaster}
            onBack={() => setSelectedMaster(null)}
            onCopyClick={() => setShowCopyModal(true)}
          />
        )}
      </div>

      <SetupCopyingModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        masterAccount={selectedMaster?.id || ""}
        masterName={selectedMaster?.name || ""}
        minInvestment={selectedMaster?.minInvestment || 100}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CopyTradingRating;
