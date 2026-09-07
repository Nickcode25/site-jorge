// Ignore taps and predominantly vertical gestures. Positive means next photo.
export function gallerySwipeStep(deltaX: number, deltaY: number): -1 | 0 | 1 {
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.3) return 0;
  return deltaX < 0 ? 1 : -1;
}
