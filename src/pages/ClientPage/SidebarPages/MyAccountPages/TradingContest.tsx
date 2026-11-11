import { ContestHeader } from "@/components/TradingContest/ContestHeader/ContestHeader";
import { CurrentTime } from "@/components/TradingContest/CurrentTime/CurrentTime";
import { ErrorMessage } from "@/components/TradingContest/ErrorMessage/ErrorMessage";
import { FilterButtons } from "@/components/TradingContest/FilterButtons/FilterButtons";
import { LoadingState } from "@/components/TradingContest/LoadingState/LoadingState";
import { SearchBar } from "@/components/TradingContest/SearchBar/SearchBar";
import { StatsDisplay } from "@/components/TradingContest/StatsDisplay/StatsDisplay";
import { TradesTable } from "@/components/TradingContest/TradesTable/TradesTable";
import { useTradeStats } from "@/hooks/useTradeContestStats";
import { useTrades } from "@/hooks/useTradingContest";
import { useCurrentTime } from "@/hooks/useTradingContestCurrentTime";

export default function TradingContest() {
  const {
    filteredTrades,
    filterType,
    searchQuery,
    loading,
    error,
    counts,
    currentPage,
    totalPages,
    totalItems,
    setFilterType,
    setSearchQuery,
    setCurrentPage,
    refresh,
  } = useTrades("open");

  const stats = useTradeStats(filteredTrades);
  const currentTime = useCurrentTime();

  if (loading && filteredTrades.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="client-theme-bg relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <ContestHeader />

        <div className="mt-5 sm:mt-6">
          {error && <ErrorMessage message={error} onRetry={refresh} />}

          <StatsDisplay stats={stats} />

          <div className="mt-5 flex flex-col gap-3 sm:mt-6 lg:flex-row lg:items-center lg:justify-between">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRefresh={refresh}
              loading={loading}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <FilterButtons
                filterType={filterType}
                openCount={counts.open}
                closedCount={counts.closed}
                onFilterChange={setFilterType}
              />
              <CurrentTime time={currentTime} />
            </div>
          </div>

          <div className="mt-5 sm:mt-6">
            <TradesTable
              trades={filteredTrades}
              filterType={filterType}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
