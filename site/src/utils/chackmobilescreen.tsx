import { getScreenSize } from "./getscreensize";


export function isMobileScreen() {
  const { width, height } = getScreenSize();
  return width < 768 || height * 3 > width * 4;
}