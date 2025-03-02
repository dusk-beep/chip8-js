import type { Config } from "./config.js";

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
    //this.canvas.width = this.width = window.innerWidth;
    //this.canvas.height = this.height = window.innerHeight;
    this.ctx = this.canvas!.getContext("2d");
  }

  clear(cfg: Config) {
    this.ctx!.fillStyle = cfg.backgroundColor;
    this.ctx!.fillRect(0, 0, this.width, this.height);
  }

  handleInput() {
    // add actual input event triggers
    while (true) {}
  }
}

export { Window };
