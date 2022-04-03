import chalk from "chalk";
import { readFile } from "fs/promises";
import { default as Jimp } from "jimp";
import { API, Color, sleep } from "./api";
import { loadConfig } from "./config";
import { fromJimp } from "./image";

async function start() {
  const cfg = await loadConfig("./config.json");

  const api = new API(cfg.token);
  api.subscribe();

  const jimpImage = await Jimp.read(await readFile(cfg.imgPath));
  const { width, height } = jimpImage.bitmap;
  const image = fromJimp(jimpImage);

  api.mitt.on("pixel", ({ x, y, color }) => {
    const cX = x - cfg.topLeftCorner.x;
    const cY = y - cfg.topLeftCorner.y;

    if (cX < 0 || cY < 0 || cX >= width || cY >= height) return;

    const expected = image[cX][cY];
    if (color === expected) return;

    console.log(
      chalk.magenta("changed pixel detected:"),
      chalk.hex(Color[color])(`(${x},${y})`)
    );
  });

  const rateLimit = () => sleep(1000 * 60 * 5.1);
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const cX = cfg.topLeftCorner.x + i;
      const cY = cfg.topLeftCorner.y + j;
      console.log(chalk.blue(`Setting pixel (${cX}, ${cY})`));
      // const response = await api.setPixel(cX, cY, image[i][j]);
      // if (!response.ok) {
      //   console.log(chalk.red(`Failed to set pixel: ${response.statusText}`));
      // }
      console.log(chalk.yellow(`Waiting for rate limit...`));
      await rateLimit();
    }
  }
}

start();
