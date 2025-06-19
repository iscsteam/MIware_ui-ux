// // services/consolelog.ts
// import { baseUrl } from "./api"

// export interface APILogDetail {
//   timestamp: Date
//   method: string
//   endpoint: string
//   status: number
//   response?: string
//   error?: string
//   duration: number
// }

// if (typeof window !== "undefined") {
//   const BASE_API_ROOT = baseUrl(""); // For comparison to filter logs
//   const originalFetch = window.fetch.bind(window);

//   (window as any).fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
//     let method = "GET";
//     let url = "";

//     if (typeof input === "string") {
//       url = input;
//       method = init?.method?.toUpperCase() || "GET";
//     } else if (input instanceof Request) {
//       url = input.url;
//       method = input.method.toUpperCase();
//     } else if (input instanceof URL) {
//       url = input.href;
//       method = init?.method?.toUpperCase() || "GET";
//     }

//     const shouldLog = url.startsWith(BASE_API_ROOT);
//     const start = performance.now();

//     try {
//       const response = await originalFetch(input, init);
//       const duration = performance.now() - start;

//       if (shouldLog) {
//         let responseBody: string | undefined;
//         try {
//           responseBody = await response.clone().text();
//         } catch {}

//         const detail: APILogDetail = {
//           timestamp: new Date(),
//           method,
//           endpoint: url,
//           status: response.status,
//           response: responseBody,
//           duration: Math.round(duration),
//         };

//         window.dispatchEvent(new CustomEvent<APILogDetail>("apiCallLogged", { detail }));
//       }

//       return response;
//     } catch (err: any) {
//       const duration = performance.now() - start;

//       if (shouldLog) {
//         const detail: APILogDetail = {
//           timestamp: new Date(),
//           method,
//           endpoint: url,
//           status: 0,
//           error: err?.message || "Unknown error",
//           duration: Math.round(duration),
//         };

//         window.dispatchEvent(new CustomEvent<APILogDetail>("apiCallLogged", { detail }));
//       }

//       throw err;
//     }
//   };
// }


// services/consolelog.ts

import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

export interface APILogDetail {
  timestamp: Date;
  method: string;
  endpoint: string;
  status: number;
  response?: any;
  error?: string;
  duration: number;
}

// --- Base API (same as baseUrl) ---
const BASE_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010";

// ---- Axios Interceptors ----
if (typeof window !== "undefined") {
  interface RequestWithMeta extends InternalAxiosRequestConfig {
    metadata?: { start: number };
  }

  axios.interceptors.request.use((config: RequestWithMeta) => {
    config.metadata = { start: performance.now() };
    return config;
  });

  axios.interceptors.response.use(
    (resp: AxiosResponse) => {
      const cfg = resp.config as RequestWithMeta;
      const start = cfg.metadata?.start ?? performance.now();
      const duration = performance.now() - start;

      if (cfg.url?.startsWith(BASE_API)) {
        const detail: APILogDetail = {
          timestamp: new Date(),
          method: (cfg.method || "GET").toUpperCase(),
          endpoint: cfg.url || "",
          status: resp.status,
          response: resp.data, // ✅ Full JSON object
          duration: Math.round(duration),
        };
        window.dispatchEvent(
          new CustomEvent<APILogDetail>("apiCallLogged", { detail })
        );
      }

      return resp;
    },
    (err: AxiosError) => {
      const cfg = (err.config as RequestWithMeta) || {};
      const start = cfg.metadata?.start ?? performance.now();
      const duration = performance.now() - start;

      if (cfg.url?.startsWith(BASE_API)) {
        const detail: APILogDetail = {
          timestamp: new Date(),
          method: (cfg.method || "GET").toUpperCase(),
          endpoint: cfg.url || "",
          status: err.response?.status ?? 0,
          error: err.message,
          duration: Math.round(duration),
        };
        window.dispatchEvent(
          new CustomEvent<APILogDetail>("apiCallLogged", { detail })
        );
      }

      return Promise.reject(err);
    }
  );

  // ---- Fetch Interceptor ----
  const originalFetch = window.fetch.bind(window);

  (window as any).fetch = async (input: any, init?: any): Promise<Response> => {
    let method = "GET";
    let url: string;

    if (typeof input === "string") {
      url = input;
      method = init?.method?.toUpperCase() || "GET";
    } else if (input instanceof Request) {
      url = input.url;
      method = input.method.toUpperCase();
    } else if (typeof URL !== "undefined" && input instanceof URL) {
      url = input.href;
      method = init?.method?.toUpperCase() || "GET";
    } else {
      url = String(input);
      method = init?.method?.toUpperCase() || "GET";
    }

    // ✅ Skip logging for non-baseUrl
    if (!url.startsWith(BASE_API)) return originalFetch(input, init);

    const start = performance.now();

    try {
      const res = await originalFetch(input, init);
      const duration = performance.now() - start;

      let parsed: any = null;
      try {
        parsed = await res.clone().json();
      } catch {
        try {
          parsed = await res.clone().text();
        } catch {}
      }

      const detail: APILogDetail = {
        timestamp: new Date(),
        method,
        endpoint: url,
        status: res.status,
        response: parsed,
        duration: Math.round(duration),
      };

      window.dispatchEvent(
        new CustomEvent<APILogDetail>("apiCallLogged", { detail })
      );

      return res;
    } catch (err: any) {
      const duration = performance.now() - start;

      const detail: APILogDetail = {
        timestamp: new Date(),
        method,
        endpoint: url,
        status: 0,
        error: err.message,
        duration: Math.round(duration),
      };

      window.dispatchEvent(
        new CustomEvent<APILogDetail>("apiCallLogged", { detail })
      );

      throw err;
    }
  };
}

export {};
