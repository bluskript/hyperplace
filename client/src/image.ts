import { default as Jimp } from "jimp";
import { Color } from "./api";

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function fromJimp(jimp: Jimp): number[][] {
  const img = new Array(jimp.bitmap.width);
  for (let i = 0; i < img.length; i++) {
    img[i] = new Array(jimp.bitmap.height);
  }

  for (let i = 0; i < jimp.bitmap.width; i++) {
    for (let j = 0; j < jimp.bitmap.height; j++) {
      const { r, g, b } = Jimp.intToRGBA(jimp.getPixelColor(i, j));
      img[i][j] = Color[rgbToHex(r, g, b)];
    }
  }

  return img;
}
