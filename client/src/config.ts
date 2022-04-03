import { readFile } from "fs/promises";

export interface Config {
  serverHost: string;
  startTime: number;
  imgPath: string;
  topLeftCorner: { x: number; y: number };
  workers: string[];
}

export async function loadConfig(path: string): Promise<Config> {
  return JSON.parse(await readFile(path, "utf-8"));
}
