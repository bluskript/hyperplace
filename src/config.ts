import { readFile } from "fs/promises";

export interface Config {
  startTime: number;
  imgPath: string;
  token: string;
  topLeftCorner: { x: number; y: number };
}

export async function loadConfig(path: string): Promise<Config> {
  return JSON.parse(await readFile(path, "utf-8"));
}
