import { Check } from "lucide-react";

interface FeatureListProps {
  features: string[];
}

export const FeatureList = ({ features }: FeatureListProps) => {
  return (
    <div>
      <h5 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-subtle">
        Account features
      </h5>
      {features && features.length > 0 ? (
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li
              key={index}
              className="group flex items-start gap-2.5 rounded-lg px-1.5 py-0.5 text-sm leading-6 text-subtle transition-all duration-150 hover:translate-x-1 hover:bg-surface-strong/[0.04] hover:text-heading"
            >
              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-700 dark:text-emerald-400 transition-transform duration-150 group-hover:scale-125" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-border bg-surface-strong/[0.03] p-3 text-center text-xs text-subtle">
          Professional trading account
        </p>
      )}
    </div>
  );
};
