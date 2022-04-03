import { readFile } from "fs/promises";

export interface Config {
  port: string;
  placerRatio: number;
}

export async function loadConfig(path: string): Promise<Config> {
  return JSON.parse(await readFile(path, "utf-8"));
}
