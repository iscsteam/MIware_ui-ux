// service/api.ts

const BASE_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010";

export function buildUrl(path: string) {
  return `${BASE_API}/${path}`;
}
   