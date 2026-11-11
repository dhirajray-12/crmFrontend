import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  liveTradingApi,
  type CloseTradePayload,
  type ModifyTradePayload,
  type PlaceTradePayload,
} from "@/services/liveTrading.service";

// Place/close both land on our own trading data + account balances, so
// invalidate both after either action settles - success or failure, since a
// slow-but-successful trade on the backend can still resolve as an error on
// the client (see the unwrapError timeout handling in the service).
export const useLiveTradeActions = () => {
  const queryClient = useQueryClient();

  const invalidateTradingState = () => {
    queryClient.invalidateQueries({ queryKey: ["tradingData"] });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  const placeTrade = useMutation({
    mutationFn: (payload: PlaceTradePayload) => liveTradingApi.placeTrade(payload),
    onSettled: invalidateTradingState,
  });

  const closeTrade = useMutation({
    mutationFn: (payload: CloseTradePayload) => liveTradingApi.closeTrade(payload),
    // Drop the position from the local cache the instant Close is clicked,
    // instead of waiting for the round trip to show it gone - the backend
    // confirms/reconciles in the background, this is just what the user
    // sees immediately. Previously the only update was the onSettled
    // invalidate below, so the row sat there (or, worse, the whole list
    // blinked empty once the slow response landed) for however long the
    // request took.
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["tradingData"] });
      const previous = queryClient.getQueryData<any>(["tradingData"]);

      queryClient.setQueryData(["tradingData"], (old: any) => {
        if (!Array.isArray(old?.openTrades)) return old;
        return {
          ...old,
          openTrades: old.openTrades.filter(
            (t: any) =>
              String(t.ticketNumber ?? t.ticket) !== String(payload.positionId),
          ),
        };
      });

      return { previous };
    },
    // The close call failed (or the broker rejected it) - put the position
    // back rather than leaving the user staring at a gap for a trade that
    // never actually closed.
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tradingData"], context.previous);
      }
    },
    onSettled: invalidateTradingState,
  });

  const modifyTrade = useMutation({
    mutationFn: (payload: ModifyTradePayload) => liveTradingApi.modifyTrade(payload),
    // Same optimistic-then-reconcile shape as closeTrade above: show the new
    // SL/TP on the row immediately, roll back if the broker rejects it.
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["tradingData"] });
      const previous = queryClient.getQueryData<any>(["tradingData"]);

      queryClient.setQueryData(["tradingData"], (old: any) => {
        if (!Array.isArray(old?.openTrades)) return old;
        return {
          ...old,
          openTrades: old.openTrades.map((t: any) =>
            String(t.ticketNumber ?? t.ticket) === String(payload.positionId)
              ? {
                  ...t,
                  stopLoss: payload.sl ?? t.stopLoss,
                  takeProfit: payload.tp ?? t.takeProfit,
                }
              : t,
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tradingData"], context.previous);
      }
    },
    onSettled: invalidateTradingState,
  });

  return { placeTrade, closeTrade, modifyTrade };
};
