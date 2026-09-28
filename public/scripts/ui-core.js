export function wrapFrame(index, frameCount) {
  return ((index % frameCount) + frameCount) % frameCount;
}
