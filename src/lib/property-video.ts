export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

// Some devices omit the MIME type for MOV files. Infer it only for known
// extensions and generic MIME types; reject conflicting file types.
export function propertyVideoContentType(file: { name: string; type: string }): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const contentType = new Map([
    ["mp4", "video/mp4"],
    ["mov", "video/quicktime"],
    ["webm", "video/webm"],
  ]).get(extension ?? "");
  if (!contentType) return null;
  if (file.type && file.type !== "application/octet-stream" && file.type !== contentType) return null;
  return contentType;
}
