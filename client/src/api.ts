import { default as Jimp } from "jimp";
import type { Emitter } from "mitt";
import mitt from "mitt";
import fetch from "node-fetch";
import WebSocket from "ws";
import { rgbToHex } from "./image";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class API {
  mitt: Emitter<{
    pixel: { x: number; y: number; color: Color };
  }> = mitt();
  ws: WebSocket;
  canvas: Jimp | undefined;

  constructor(private token: string) {
    this.ws = new WebSocket("wss://gql-realtime-2.reddit.com/query", {
      origin: "https://hot-potato.reddit.com",
    });
    this.ws.on("open", this.onSocketOpen.bind(this));
  }

  setPixel(x: number, y: number, color: Color) {
    return fetch("https://gql-realtime-2.reddit.com/query", {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "apollographql-client-name": "mona-lisa",
        "apollographql-client-version": "0.0.1",
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
        "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
      referrer: "https://hot-potato.reddit.com/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: JSON.stringify({
        operationName: "setPixel",
        variables: {
          input: {
            actionName: "r/replace:set_pixel",
            PixelMessageData: {
              coordinate: { x, y },
              colorIndex: color,
              canvasIndex: 0,
            },
          },
        },
        query:
          "mutation setPixel($input: ActInput!) {\\n  act(input: $input) {\\n    data {\\n      ... on BasicMessage {\\n        id\\n        data {\\n          ... on GetUserCooldownResponseMessageData {\\n            nextAvailablePixelTimestamp\\n            __typename\\n          }\\n          ... on SetPixelResponseMessageData {\\n            timestamp\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n",
      }),
      method: "POST",
    });
  }

  send(object: any) {
    this.ws.send(JSON.stringify(object));
  }

  subscribe() {
    this.ws.on("message", async (raw) => {
      const data = JSON.parse(raw.toString());
      const subscribeData = data?.payload?.data?.subscribe?.data;

      if (subscribeData?.__typename === "DiffFrameMessageData") {
        const img = await Jimp.read(subscribeData.name);
        for (let i = 0; i < img.bitmap.width; i++) {
          for (let j = 0; j < img.bitmap.height; j++) {
            const { r, g, b, a } = Jimp.intToRGBA(img.getPixelColor(i, j));
            if (a === 0) continue;
            this.mitt.emit("pixel", {
              x: i,
              y: j,
              color: Color[rgbToHex(r, g, b)],
            });
          }
        }
      } else if (subscribeData?.__typename === "FullFrameMessageData") {
        const img = await Jimp.read(subscribeData.name);
        this.canvas = img;
      } else {
        console.log(`received unknown message:`, subscribeData || data);
      }
    });
  }

  onSocketOpen() {
    this.send({
      type: "connection_init",
      payload: { Authorization: `Bearer ${this.token}` },
    });
    this.send({
      id: "1",
      type: "start",
      payload: {
        variables: {
          input: {
            channel: {
              teamOwner: "AFD2022",
              category: "CONFIG",
            },
          },
        },
        extensions: {},
        operationName: "configuration",
        query:
          "subscription configuration($input: SubscribeInput!) {\n  subscribe(input: $input) {\n    id\n    ... on BasicMessage {\n      data {\n        __typename\n        ... on ConfigurationMessageData {\n          colorPalette {\n            colors {\n              hex\n              index\n              __typename\n            }\n            __typename\n          }\n          canvasConfigurations {\n            index\n            dx\n            dy\n            __typename\n          }\n          canvasWidth\n          canvasHeight\n          __typename\n        }\n      }\n      __typename\n    }\n    __typename\n  }\n}\n",
      },
    });
    this.send({
      id: "2",
      type: "start",
      payload: {
        variables: {
          input: {
            channel: {
              teamOwner: "AFD2022",
              category: "CANVAS",
              tag: "0",
            },
          },
        },
        extensions: {},
        operationName: "replace",
        query:
          "subscription replace($input: SubscribeInput!) {\n  subscribe(input: $input) {\n    id\n    ... on BasicMessage {\n      data {\n        __typename\n        ... on FullFrameMessageData {\n          __typename\n          name\n          timestamp\n        }\n        ... on DiffFrameMessageData {\n          __typename\n          name\n          currentTimestamp\n          previousTimestamp\n        }\n      }\n      __typename\n    }\n    __typename\n  }\n}\n",
      },
    });
  }
}

export enum Color {
  "#be0039" = 1,
  "#ff4500" = 2,
  "#ffa800" = 3,
  "#ffd635" = 4,
  "#00a368" = 6,
  "#00cc78" = 7,
  "#7eed56" = 8,
  "#00756f" = 9,
  "#009eaa" = 10,
  "#2450a4" = 12,
  "#3690ea" = 13,
  "#51e9f4" = 14,
  "#493ac1" = 15,
  "#6a5cff" = 16,
  "#811e9f" = 18,
  "#b44ac0" = 19,
  "#ff3881" = 22,
  "#ff99aa" = 23,
  "#6d482f" = 24,
  "#9c6926" = 25,
  "#000000" = 27,
  "#898d90" = 29,
  "#d4d7d9" = 30,
  "#ffffff" = 31,
}
