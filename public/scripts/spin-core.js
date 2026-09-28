export function wrapFrame(index, frameCount) {
  if (!Number.isInteger(frameCount) || frameCount < 1) return 0;
  return ((Math.round(index) % frameCount) + frameCount) % frameCount;
}

export function frameFromDrag(startFrame, deltaX, frameCount, pixelsPerFrame = 14) {
  const step = Math.max(1, Number(pixelsPerFrame) || 14);
  return wrapFrame(startFrame + Math.round(deltaX / step), frameCount);
}

export function frameDegrees(index, frameCount) {
  if (!Number.isInteger(frameCount) || frameCount < 1) return 0;
  return Math.round(wrapFrame(index, frameCount) * 360 / frameCount) % 360;
}

export function angleLabel(degrees) {
  const angle = ((Math.round(degrees) % 360) + 360) % 360;
  if (angle < 23 || angle >= 338) return "Front";
  if (angle < 68) return "Front right";
  if (angle < 113) return "Right profile";
  if (angle < 158) return "Back right";
  if (angle < 203) return "Back";
  if (angle < 248) return "Back left";
  if (angle < 293) return "Left profile";
  return "Front left";
}
