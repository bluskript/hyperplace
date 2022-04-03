import { Context } from "koa";
import WebSocket from "ws";
import { Config } from "./config";

export class API {
  connections: Record<
    string,
    {
      ws: WebSocket;
      completed: boolean;
      placer: boolean;
    }
  > = {};

  constructor(private cfg: Config) {}

  async socketHandler(ctx: Context) {
    if (!ctx.ws) return;
    const ws: WebSocket = await ctx.ws();

    const placer =
      this.numPlacers / Object.entries(this.connections).length <
      this.cfg.placerRatio;

    ws.on("close", () => delete this.connections[ctx.request.ip]);
    ws.on("open", () => {
      this.connections[ctx.request.ip] = { ws, completed: false, placer };
    });
    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === "placed") {
        this.connections[ctx.request.ip].completed = true;

        const batchComplete = Object.values(this.connections).every(
          ({ completed, placer }) => completed && placer
        );

        if (batchComplete) {
          Object.values(this.connections).map(({ ws }, i) => {
            ws.send(
              JSON.stringify({
                newID: i,
              })
            );
            i++;
          });
        }
      }
    });
  }

  private get numPlacers() {
    return Object.values(this.connections).filter((c) => c.placer).length;
  }
}
