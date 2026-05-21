type AsyncFn<T> = () => Promise<T>;

const inFlightRequests = new Map<string, Promise<unknown>>();

export class HltvServiceError extends Error {
  constructor(
    message: string,
    public readonly context: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "HltvServiceError";
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  operation: AsyncFn<T>,
  context: Record<string, unknown>,
  retries = 2,
  baseDelayMs = 600,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      if (attempt > 0) {
        console.info("[hltv] retry", { attempt, ...context });
      }

      return await operation();
    } catch (error) {
      lastError = error;
      console.error("[hltv] request failed", { attempt, ...context, error });

      if (attempt < retries) {
        await wait(baseDelayMs * 2 ** attempt);
      }
    }
  }

  throw new HltvServiceError("HLTV request failed after retries", {
    ...context,
    cause: lastError instanceof Error ? lastError.message : String(lastError),
  });
}

export async function dedupe<T>(key: string, operation: AsyncFn<T>): Promise<T> {
  const existing = inFlightRequests.get(key);

  if (existing) {
    return existing as Promise<T>;
  }

  const promise = operation().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

export function toIsoDate(timestamp?: number | null) {
  return timestamp ? new Date(timestamp).toISOString() : null;
}
