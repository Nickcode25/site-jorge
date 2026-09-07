import assert from "node:assert/strict";
import test from "node:test";
import { propertyVideoContentType } from "../src/lib/property-video.ts";

test("accepts MP4 and MOV, including uppercase and missing device MIME types", () => {
  for (const [name, type, expected] of [
    ["tour.mp4", "video/mp4", "video/mp4"],
    ["tour.MOV", "video/quicktime", "video/quicktime"],
    ["tour.MOV", "", "video/quicktime"],
    ["tour.mp4", "application/octet-stream", "video/mp4"],
    ["tour.webm", "video/webm", "video/webm"],
  ]) assert.equal(propertyVideoContentType({ name, type }), expected);
});

test("rejects unsupported extensions and conflicting MIME types", () => {
  for (const [name, type] of [
    ["tour.avi", "video/x-msvideo"],
    ["tour.exe", "video/mp4"],
    ["tour.mov", "text/html"],
    ["tour.mp4", "image/png"],
    ["tour", ""],
  ]) assert.equal(propertyVideoContentType({ name, type }), null);
});
