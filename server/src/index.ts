import Router from "@koa/router";
import chalk from "chalk";
import Koa from "koa";
import websocket from "koa-easy-ws";
import { API } from "./api";
import { loadConfig } from "./config";

async function start() {
  const cfg = await loadConfig("./config.json");

  const app = new Koa();
  app.use(websocket());

  const router = new Router();
  const api = new API(cfg);
  router.all("/", api.socketHandler.bind(api));

  app.use(router.routes());

  app
    .listen(cfg.port)
    .on("listening", () =>
      console.log(
        chalk.magenta("Hyperplace server started on port " + cfg.port)
      )
    );
}

start();
