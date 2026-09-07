import assert from "node:assert/strict";
import test from "node:test";
import { gallerySwipeStep } from "../src/lib/gallery-swipe.ts";

test("horizontal swipes navigate in both directions", () => {
  assert.equal(gallerySwipeStep(-100, 12), 1);
  assert.equal(gallerySwipeStep(100, -12), -1);
  assert.equal(gallerySwipeStep(-48, 0), 1);
});

test("taps, small movements and vertical gestures do not change photos", () => {
  for (const [x, y] of [[0, 0], [47, 0], [-47, 5], [20, 100], [100, 100], [-100, -100]]) {
    assert.equal(gallerySwipeStep(x, y), 0);
  }
});
