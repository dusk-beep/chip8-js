import {initConfig, type Config} from "./config.js"
import {Window} from "./window.js"
import { Chip8State, Chip8 } from "./chip8.js"
import {Romdata} from "./Romdata.ts"
const myConf: Config = initConfig();

const win = new Window(myConf);
win.clearscreen();

const chip8 = new Chip8(Chip8State.Running, myConf, win);

function loadRom(arrBuf: ArrayBuffer) {
  const uint8View = new Uint8Array(arrBuf);
  const romData = new Romdata(uint8View);

  // You need to reset the machine here before loading.
  chip8.reset()
  chip8.load(romData);

  chip8.state = Chip8State.Running;
}

let timer = 0;

function emuLoop() {
  timer++;

  if (chip8.state !== Chip8State.Quit) {
    try {
      chip8.emulate_instruction();
    } catch (error) {
      console.log(error);
    }

    if (timer % 5 === 0) {
      chip8.emulateTimers();
      timer = 0;
    }
  }

  setTimeout(emuLoop, 3);
}

emuLoop();

export { loadRom };
