import { Lightbulb } from "lucide-react";

export const ProTips = () => {
  const tips = [
    "Share your link on social media for maximum reach",
    "Explain the benefits to increase conversion rates",
    "Track your performance in the Partner Dashboard",
    "Support your referrals to boost their success",
  ];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="absolute inset-y-0 left-0 w-1 bg-amber-400" />
      <div className="mb-4 flex items-center gap-2 pl-2">
        <Lightbulb className="h-4 w-4 text-amber-700 dark:text-amber-300" />
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-heading">
          Pro Tips
        </h3>
      </div>
      <ul className="space-y-2 pl-2 text-xs text-subtle sm:text-sm">
        {tips.map((tip, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5"
          >
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-[11px] font-bold text-amber-700 dark:text-amber-300">
              {index + 1}
            </span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
