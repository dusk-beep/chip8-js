import { initConfig, type Config } from "./config.js";

enum chip8State {
  Quit,
  Paused,
  Running
}

interface Chip8 {
  state: chip8State;
}

class Window {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;

  constructor(conf: Config) {
    this.canvas = document.querySelector(".canvas");
    if (!this.canvas) {
      throw Error("no canvas");
    }
    this.canvas.width = conf.windowWidth * conf.scaleFactor;
    this.canvas.height = conf.windowHeight * conf.scaleFactor;
    this.ctx = this.canvas!.getContext("2d");
  }
}

function main(): number {
  const myConf: Config = initConfig();

  const window = new Window(myConf); // could throw error

  return 0;
}

main();
