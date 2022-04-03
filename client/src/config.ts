import { readFile } from "fs/promises";

import YAML from "yaml";

export interface Config {
  serverHost: string;
  startTime: number;
  imgPath: string;
  topLeftCorner: { x: number; y: number };
  workers: string[];
}

export async function loadConfig(path: string): Promise<Config> {
  return YAML.parse(await readFile(path, "utf-8"));
}
