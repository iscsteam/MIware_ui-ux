
export const baseUrl = (path: string): string => {
  const baseurl = process.env.NEXT_PUBLIC_API_URL

  if (!baseurl) {
    throw new Error("Environment variable NEXT_PUBLIC_API_URL is not set")
  }

  return `${baseurl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
}

