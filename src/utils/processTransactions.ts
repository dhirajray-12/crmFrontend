// Not currently imported anywhere (src/hooks/useTransactions.ts, its only
// caller, isn't wired into any component either) — left as a no-op rather
// than guessing at intended behavior.
export const processTransactions = (data: unknown, timePeriod: number) => {
  void data;
  void timePeriod;
};
