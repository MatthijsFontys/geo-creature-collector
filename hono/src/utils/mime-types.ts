import mime from "mime";

export function getMime(path: string, fallback?: string): string {
  const mimeType = mime.getType(path) || (fallback && mime.getType(fallback));
  if (!mimeType) {
    throw new Error(`No MIME type found for path: ${path}`);
  }
  return mimeType;
}
