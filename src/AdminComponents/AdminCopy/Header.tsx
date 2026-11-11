import { ArrowLeft } from "lucide-react";
import type { View, Master, SelectedCopier } from "@/types/copyTrading.types";

interface HeaderProps {
  view: View;
  selectedMaster: Master | null;
  selectedCopier: SelectedCopier | null;
  onBack: () => void;
}

export const Header = ({
  view,
  selectedMaster,
  selectedCopier,
  onBack,
}: HeaderProps) => {
  const getTitle = () => {
    if (view === "main") return "Copy Trading Dashboard";
    if (view === "copiers") return `${selectedMaster?.name} - Copiers`;
    return `Trades - ${selectedCopier?.account}`;
  };

  const getSubtitle = () => {
    if (view === "main") return "Monitor your copy trading performance";
    if (view === "copiers") return `Master Account: ${selectedMaster?.account}`;
    return `Master: ${selectedCopier?.masterAccount}`;
  };

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-2">
        {view !== "main" && (
          <button
            onClick={onBack}
            className="p-2 bg-surface-strong border-2 border-border rounded-xl hover:bg-surface transition-all duration-300 shadow-md"
          >
            <ArrowLeft className="w-5 h-5 text-body" />
          </button>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-heading mb-2">
            {getTitle()}
          </h1>
          <p className="text-body">{getSubtitle()}</p>
        </div>
      </div>
    </div>
  );
};
