import { readFile } from "fs/promises";
import YAML from "yaml";

export interface Config {
  port: number;
  placerRatio: number;
}

export async function loadConfig(path: string): Promise<Config> {
  return YAML.parse(await readFile(path, "utf-8"));
}
