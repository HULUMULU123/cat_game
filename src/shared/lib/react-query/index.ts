import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

export type QueryKey = readonly unknown[];

type QueryStatus = "idle" | "loading" | "success" | "error";

type Listener = () => void;

type Updater<T> = T | ((oldData: T | undefined) => T);

interface QueryState<TData> {
  key: QueryKey;
  data?: TData;
  error?: unknown;
  status: QueryStatus;
  updatedAt: number;
  listeners: Set<Listener>;
  promise?: Promise<TData>;
}

export interface QueryClientConfig {
  defaultOptions?: {
    queries?: {
      staleTime?: number;
    };
  };
}

interface QueryOptions {
  staleTime: number;
}

function hashQueryKey(key: QueryKey): string {
  return JSON.stringify(key);
}

function matchesPartial(target: QueryKey, candidate: QueryKey): boolean {
  if (target.length === 0) return true;
  if (target.length > candidate.length) return false;
  return target.every((value, index) => candidate[index] === value);
}

export class QueryClient {
  private cache = new Map<string, QueryState<any>>();
  private readonly defaultStaleTime: number;

  constructor(config: QueryClientConfig = {}) {
    this.defaultStaleTime = config.defaultOptions?.queries?.staleTime ?? 0;
  }

  private getHash(key: QueryKey) {
    return hashQueryKey(key);
  }

  private getOrCreateState<T>(key: QueryKey): QueryState<T> {
    const hash = this.getHash(key);
    const existing = this.cache.get(hash);
    if (existing) {
      existing.key = key;
      return existing as QueryState<T>;
    }
    const state: QueryState<T> = {
      key,
      status: "idle",
      updatedAt: 0,
      listeners: new Set(),
    };
    this.cache.set(hash, state);
    return state;
  }

  private getState<T>(key: QueryKey): QueryState<T> | undefined {
    const hash = this.getHash(key);
    return this.cache.get(hash) as QueryState<T> | undefined;
  }

  private notify(state: QueryState<any>) {
    state.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("[react-query] listener error", error);
      }
    });
  }

  getDefaultOptions(): QueryOptions {
    return { staleTime: this.defaultStaleTime };
  }

  subscribe(key: QueryKey, listener: Listener): () => void {
    const state = this.getOrCreateState(key);
    state.listeners.add(listener);
    return () => {
      state.listeners.delete(listener);
    };
  }

  getQueryState<T>(key: QueryKey): QueryState<T> | undefined {
    return this.getState<T>(key);
  }

  getQueryData<T>(key: QueryKey): T | undefined {
    return this.getState<T>(key)?.data;
  }

  setQueryData<T>(key: QueryKey, updater: Updater<T>) {
    const state = this.getOrCreateState<T>(key);
    state.data =
      typeof updater === "function"
        ? (updater as (old: T | undefined) => T)(state.data)
        : updater;
    state.error = undefined;
    state.status = "success";
    state.updatedAt = Date.now();
    this.notify(state);
  }

  invalidateQueries(partialKey?: QueryKey) {
    const target = partialKey ?? ([] as QueryKey);
    this.cache.forEach((state) => {
      if (matchesPartial(target, state.key)) {
        state.updatedAt = 0;
        this.notify(state);
      }
    });
  }

  private isStale(state: QueryState<any>, staleTime: number) {
    if (state.status === "idle" || state.status === "error") return true;
    if (staleTime === Infinity) return false;
    return Date.now() - state.updatedAt >= staleTime;
  }

  async fetchQuery<T>(
    key: QueryKey,
    queryFn: () => Promise<T>,
    options?: Partial<QueryOptions>,
    force = false,
  ): Promise<T> {
    const state = this.getOrCreateState<T>(key);
    const staleTime = options?.staleTime ?? this.defaultStaleTime;

    if (!force) {
      if (state.promise) return state.promise;
      if (state.data !== undefined && !this.isStale(state, staleTime)) {
        return state.data;
      }
    }

    const promise = (async () => {
      try {
        state.status = state.data === undefined ? "loading" : "loading";
        state.error = undefined;
        this.notify(state);
        const data = await queryFn();
        state.data = data;
        state.status = "success";
        state.updatedAt = Date.now();
        return data;
      } catch (error) {
        state.error = error;
        state.status = "error";
        throw error;
      } finally {
        state.promise = undefined;
        this.notify(state);
      }
    })();

    state.promise = promise;
    return promise;
  }
}

const QueryClientContext = createContext<QueryClient | null>(null);

export interface QueryClientProviderProps {
  client: QueryClient;
}

export function QueryClientProvider({
  client,
  children,
}: PropsWithChildren<QueryClientProviderProps>) {
  const memoClient = useMemo(() => client, [client]);
  return (
    <QueryClientContext.Provider value={memoClient}>
      {children}
    </QueryClientContext.Provider>
  );
}

export function useQueryClient(): QueryClient {
  const client = useContext(QueryClientContext);
  if (!client) {
    throw new Error("useQueryClient must be used within a QueryClientProvider");
  }
  return client;
}

export interface UseQueryOptions<TQueryFnData, TData = TQueryFnData> {
  queryKey: QueryKey;
  queryFn: () => Promise<TQueryFnData>;
  enabled?: boolean;
  staleTime?: number;
  select?: (data: TQueryFnData) => TData;
}

export interface UseQueryResult<TData> {
  data: TData | undefined;
  error: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  status: QueryStatus;
  refetch: () => Promise<TData>;
}

export function useQuery<TQueryFnData, TData = TQueryFnData>(
  options: UseQueryOptions<TQueryFnData, TData>,
): UseQueryResult<TData> {
  const { queryKey, queryFn, enabled = true, staleTime, select } = options;
  const client = useQueryClient();
  const [, forceUpdate] = useReducer((v) => v + 1, 0);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  useEffect(() => {
    return client.subscribe(queryKey, () => forceUpdate());
  }, [client, queryKey]);

  const state = client.getQueryState<TQueryFnData>(queryKey);
  const finalStaleTime = staleTime ?? client.getDefaultOptions().staleTime;

  useEffect(() => {
    if (!enabled) return;
    void client
      .fetchQuery(queryKey, () => queryFnRef.current(), {
        staleTime: finalStaleTime,
      })
      .catch(() => {
        /* error stored inside query state */
      });
  }, [client, enabled, queryKey, finalStaleTime, state?.updatedAt, state?.status]);

  const selectedData = useMemo(() => {
    if (select && state?.data !== undefined) {
      try {
        return select(state.data);
      } catch (error) {
        console.error("[react-query] select error", error);
        return undefined;
      }
    }
    return state?.data as unknown as TData | undefined;
  }, [select, state?.data]);

  const status = state?.status ?? "idle";
  const isFetching = status === "loading" && state?.promise !== undefined;
  const isLoading = status === "loading" && state?.data === undefined;
  const isError = status === "error";
  const isSuccess = status === "success";

  const refetch = useCallback(() => {
    return client.fetchQuery(
      queryKey,
      () => queryFnRef.current(),
      {
        staleTime: finalStaleTime,
      },
      true,
    );
  }, [client, queryKey, finalStaleTime]);

  return {
    data: selectedData,
    error: state?.error,
    isError,
    isLoading,
    isFetching,
    isSuccess,
    status,
    refetch,
  };
}

export interface UseMutationOptions<TData, TError, TVariables, TContext> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext | undefined,
  ) => void;
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined,
  ) => void;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined,
  ) => void;
}

export interface UseMutationResult<TData, TError, TVariables> {
  data: TData | undefined;
  error: TError | null;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}

export function useMutation<
  TData,
  TError = unknown,
  TVariables = void,
  TContext = void,
>(options: UseMutationOptions<TData, TError, TVariables, TContext>): UseMutationResult<TData, TError, TVariables> {
  const { mutationFn, onError, onSettled, onSuccess } = options;
  const stateRef = useRef({
    status: "idle" as QueryStatus,
    data: undefined as TData | undefined,
    error: null as TError | null,
  });
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const setState = useCallback(
    (update: Partial<{ status: QueryStatus; data: TData | undefined; error: TError | null }>) => {
      stateRef.current = { ...stateRef.current, ...update };
      forceUpdate();
    },
    [forceUpdate],
  );

  const reset = useCallback(() => {
    stateRef.current = { status: "idle", data: undefined, error: null };
    forceUpdate();
  }, [forceUpdate]);

  const mutateAsync = useCallback(
    async (variables: TVariables) => {
      setState({ status: "loading", error: null });
      try {
        const data = await mutationFn(variables);
        setState({ status: "success", data });
        onSuccess?.(data, variables, undefined as TContext | undefined);
        onSettled?.(data, null, variables, undefined as TContext | undefined);
        return data;
      } catch (error) {
        setState({ status: "error", error: error as TError });
        onError?.(error as TError, variables, undefined as TContext | undefined);
        onSettled?.(undefined, error as TError, variables, undefined as TContext | undefined);
        throw error;
      }
    },
    [mutationFn, onError, onSettled, onSuccess, setState],
  );

  const mutate = useCallback(
    (variables: TVariables) => {
      void mutateAsync(variables);
    },
    [mutateAsync],
  );

  const snapshot = stateRef.current;
  return {
    data: snapshot.data,
    error: snapshot.error,
    isIdle: snapshot.status === "idle",
    isLoading: snapshot.status === "loading",
    isSuccess: snapshot.status === "success",
    isError: snapshot.status === "error",
    mutate,
    mutateAsync,
    reset,
  };
}

