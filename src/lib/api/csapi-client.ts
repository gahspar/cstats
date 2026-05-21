import axios, { AxiosError, type AxiosInstance } from "axios";

const API_BASE_URL =
  typeof window === "undefined"
    ? (process.env.CS_API_BASE_URL ?? "https://api.csapi.de")
    : "/api/cs";

let lastRequestAt = 0;
const minimumGapMs = 220;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForRateLimit() {
  const elapsed = Date.now() - lastRequestAt;

  if (elapsed < minimumGapMs) {
    await sleep(minimumGapMs - elapsed);
  }

  lastRequestAt = Date.now();
}

export const csapiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

csapiClient.interceptors.request.use(async (config) => {
  await waitForRateLimit();
  return config;
});

csapiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config;
  const retryCount = Number(config?.headers?.["x-retry-count"] ?? 0);
  const status = error.response?.status ?? 0;
  const retryable = status === 0 || status === 429 || status >= 500;

  if (!config || retryCount >= 2 || !retryable) {
    return Promise.reject(error);
  }

  await sleep(450 * (retryCount + 1));

  return csapiClient.request({
    ...config,
    headers: {
      ...config.headers,
      "x-retry-count": retryCount + 1,
    },
  });
});
