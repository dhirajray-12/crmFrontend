import React from 'react';
import { Calendar } from 'lucide-react';
import { useAccountActivityStore } from '@/Store/accountActivityStore';

const timeOptions = [7, 14, 30, 60, 90];

export const TimePeriodDropdown: React.FC = () => {
    const { timePeriod, dropdownOpen, setTimePeriod, setDropdownOpen } = useAccountActivityStore();

    return (
        <div className="relative w-full sm:w-auto">
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface-strong/[0.06] px-4 py-2.5 text-heading shadow-lg transition-all duration-300 hover:bg-surface-strong/[0.08] sm:py-3"
            >
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span className="text-sm font-semibold sm:text-base">
                        Last {timePeriod} Days
                    </span>
                </div>
                <svg
                    className={`h-4 w-4 text-subtle transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {dropdownOpen && (
                <div className="client-theme-surface-strong absolute z-20 mt-2 w-full overflow-hidden rounded-xl shadow-2xl">
                    {timeOptions.map((option) => (
                        <div
                            key={option}
                            onClick={() => {
                                setTimePeriod(option);
                                setDropdownOpen(false);
                            }}
                            className={`cursor-pointer border-b border-border px-4 py-2.5 transition-all duration-200 last:border-b-0 sm:px-6 sm:py-3 ${timePeriod === option
                                ? 'bg-accent/[0.14] font-bold text-accent'
                                : 'font-medium text-heading hover:bg-surface-strong/[0.06]'
                                }`}
                        >
                            Last {option} Days
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
