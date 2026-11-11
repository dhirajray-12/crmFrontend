import { FilterTypeButtons } from "./FilterTypeButtons";
import { MiniCalendar } from "../MiniCalendar/MiniCalendar";
import { ExportButton } from "./ExportButton";

interface FilterSidebarProps {
    selectedType: string;
    onTypeSelect: (type: string) => void;
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    onExport: () => void;
}

export const FilterSidebar = ({
    selectedType,
    onTypeSelect,
    selectedDate,
    onDateSelect,
    onExport,
}: FilterSidebarProps) => {
    return (
        <aside className="hidden lg:block lg:col-span-4">
            <div className="lg:sticky lg:top-4 space-y-3 sm:space-y-6">
                <div className="client-theme-surface-strong rounded-2xl border border-border p-3 shadow-[0_18px_48px_rgba(2,6,23,0.28)] sm:rounded-3xl sm:p-6">
                    <h2 className="mb-4 text-base font-bold text-heading sm:text-lg">Filters</h2>

                    <FilterTypeButtons selectedType={selectedType} onSelect={onTypeSelect} />

                    <div className="mb-4 sm:mb-5 text-heading">
                        <MiniCalendar selectedDate={selectedDate} onSelect={onDateSelect} />
                    </div>

                    <ExportButton onClick={onExport} />
                </div>
            </div>
        </aside>
    );
};
