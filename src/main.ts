import { initConfig, type Config } from "./config.js";
import { sleep } from "./utilities.js";
import { Chip8State, Chip8 } from "./chip8.js";

class Window {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  width: number;
  height: number;

  constructor(conf: Config) {
    this.canvas = document.querySelector(".canvas");
    if (!this.canvas) {
      throw Error("no canvas");
    }
    this.canvas.width = this.width = conf.windowWidth * conf.scaleFactor;
    this.canvas.height = this.height = conf.windowHeight * conf.scaleFactor;
    this.ctx = this.canvas!.getContext("2d");
  }

  clear(cfg: Config) {
    this.ctx!.fillStyle = cfg.backgroundColor;
    this.ctx!.fillRect(0, 0, this.width, this.height);
  }

  handle_input() {
    // add actual input event triggers
    while (true) {}
  }
}

function main(): number {
  const myConf: Config = initConfig();

  const window = new Window(myConf); // could throw error
  const chip8 = new Chip8(Chip8State.Running, "pong");

  while (chip8.state == Chip8State.Running) {
    //window.handle_input();
    sleep(16);
  }
  return 0;
}

main();
