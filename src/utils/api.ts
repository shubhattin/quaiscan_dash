const BASE_URL = "https://quaiscan.io/api";

interface ApiTracker {
  requests: number;
  errors: number;
  lastRequestTime: number | null;
  logs: string[];
}

export const apiTracker: ApiTracker = {
  requests: 0,
  errors: 0,
  lastRequestTime: null,
  logs: [],
};

function log(message: string, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[API ${timestamp}] ${message}`;

  if (isError) {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }

  apiTracker.logs.push(logMessage);
  // Keep logs from growing indefinitely
  if (apiTracker.logs.length > 100) {
    apiTracker.logs.shift();
  }
}

async function fetcher<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(BASE_URL);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key]),
  );

  apiTracker.requests++;
  apiTracker.lastRequestTime = Date.now();
  const start = performance.now();

  log(`REQ -> ${url.search}`); // Log only search params for brevity in console usually, but here full path might be clearer. simpler:

  try {
    const response = await fetch(url.toString());
    const duration = (performance.now() - start).toFixed(0);

    log(`RES <- ${response.status} (${duration}ms)`);

    if (!response.ok) {
      throw new Error(`HTTP Status ${response.status}`);
    }

    const data = await response.json();

    // Check for API-level errors often returned in JSON 200 responses
    if (
      data &&
      typeof data === "object" &&
      "status" in data &&
      data.status === "0"
    ) {
      log(`API Error: ${data.message}`, true);
      // Often "No transactions found" is status 0 but not a critical error, but for robust client we note it.
    }

    return data;
  } catch (error) {
    apiTracker.errors++;
    log(
      `ERR !! ${error instanceof Error ? error.message : String(error)}`,
      true,
    );
    throw error;
  }
}

export interface QuaiBalanceResponse {
  message: string;
  result: string;
  status: string;
}

export interface QuaiTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId?: string;
  functionName?: string;
}

export interface QuaiTxListResponse {
  message: string;
  result: QuaiTransaction[];
  status: string;
}

export const api = {
  getBalance: async (address: string) => {
    return fetcher<QuaiBalanceResponse>({
      module: "account",
      action: "balance",
      address,
    });
  },

  getTransactions: async (address: string, page = 1, offset = 10) => {
    return fetcher<QuaiTxListResponse>({
      module: "account",
      action: "txlist",
      address,
      startblock: "0",
      endblock: "99999999",
      page: String(page),
      offset: String(offset),
      sort: "desc",
    });
  },

  getTrackerStats: () => ({ ...apiTracker }),
};
