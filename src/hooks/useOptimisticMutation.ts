// src/hooks/useOptimisticMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  QueryKey,
  UseMutationOptions,
  QueryClient,
  MutationFunctionContext,
} from "@tanstack/react-query";
import { useErrorStore } from "@/Store/error.store";

type SnapshotItem = {
  queryKey: QueryKey;
  data: unknown;
};

type InternalMutationContext<TContext> = TContext & {
  __snapshots?: SnapshotItem[];
};

interface OptimisticMutationOptions<TData, TVariables, TContext = unknown>
  extends Omit<
    UseMutationOptions<
      TData,
      Error,
      TVariables,
      InternalMutationContext<TContext>
    >,
    "onMutate" | "onSuccess" | "onError" | "onSettled"
  > {
  onSuccess?: UseMutationOptions<
    TData,
    Error,
    TVariables,
    InternalMutationContext<TContext>
  >["onSuccess"];
  onError?: UseMutationOptions<
    TData,
    Error,
    TVariables,
    InternalMutationContext<TContext>
  >["onError"];
  onSettled?: UseMutationOptions<
    TData,
    Error,
    TVariables,
    InternalMutationContext<TContext>
  >["onSettled"];

  invalidateQueries?: QueryKey[];
  invalidateKeys?: string[];
  optimisticUpdate?: (
    variables: TVariables,
    queryClient: QueryClient,
  ) => TContext | Promise<TContext>;
  rollbackOnError?: boolean;
}

export function useOptimisticMutation<
  TData,
  TVariables,
  TContext = unknown,
>(options: OptimisticMutationOptions<TData, TVariables, TContext>) {
  const {
    invalidateQueries = [],
    invalidateKeys = [],
    optimisticUpdate,
    rollbackOnError = true,
    onSuccess,
    onError,
    onSettled,
    ...mutationOptions
  } = options;

  const queryClient = useQueryClient();
  const { handleApiError } = useErrorStore();

  return useMutation<
    TData,
    Error,
    TVariables,
    InternalMutationContext<TContext>
  >({
    ...mutationOptions,

    onMutate: async (
      variables: TVariables,
    ): Promise<InternalMutationContext<TContext>> => {
      const allQueryKeys: QueryKey[] = [
        ...invalidateQueries,
        ...invalidateKeys.map((key) => [key]),
      ];

      await Promise.all(
        allQueryKeys.map((queryKey) =>
          queryClient.cancelQueries({ queryKey }),
        ),
      );

      const snapshots: SnapshotItem[] = allQueryKeys.map((queryKey) => ({
        queryKey,
        data: queryClient.getQueryData(queryKey),
      }));

      let optimisticContext = {} as TContext;

      if (optimisticUpdate) {
        optimisticContext = await optimisticUpdate(variables, queryClient);
      }

      return {
        ...optimisticContext,
        __snapshots: snapshots,
      };
    },

    onSuccess: async (
      data: TData,
      variables: TVariables,
      context: InternalMutationContext<TContext>,
      mutationContext: MutationFunctionContext,
    ) => {
      await Promise.all([
        ...invalidateQueries.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
        ...invalidateKeys.map((key) =>
          queryClient.invalidateQueries({ queryKey: [key] }),
        ),
      ]);

      if (onSuccess) {
        await onSuccess(data, variables, context, mutationContext);
      }
    },

    onError: async (
      error: Error,
      variables: TVariables,
      context: InternalMutationContext<TContext> | undefined,
      mutationContext: MutationFunctionContext,
    ) => {
      if (rollbackOnError && context?.__snapshots) {
        context.__snapshots.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      handleApiError(error);

      if (onError) {
        await onError(error, variables, context, mutationContext);
      }
    },

    onSettled: async (
      data: TData | undefined,
      error: Error | null,
      variables: TVariables,
      context: InternalMutationContext<TContext> | undefined,
      mutationContext: MutationFunctionContext,
    ) => {
      if (onSettled) {
        await onSettled(data, error, variables, context, mutationContext);
      }
    },
  });
}
