import { Award, Crown } from "lucide-react";
import { COMMISSION_TIPS, BEST_PRACTICES } from "@/utils/MasterPage.constant";

export const FormTips = () => {
    return (
        <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4">
                <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" />
                <div className="pl-2">
                    <div className="mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                        <h4 className="font-semibold text-heading">Commission Tips</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-subtle">
                        {COMMISSION_TIPS.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="mt-1 text-emerald-700 dark:text-emerald-300">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4">
                <div className="absolute inset-y-0 left-0 w-1 bg-violet-400" />
                <div className="pl-2">
                    <div className="mb-3 flex items-center gap-2">
                        <Crown className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                        <h4 className="font-semibold text-heading">Best Practices</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-subtle">
                        {BEST_PRACTICES.map((practice, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="mt-1 text-purple-700 dark:text-purple-300">•</span>
                                <span>{practice}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
