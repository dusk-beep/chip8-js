import { initConfig, type Config } from "./config.js";
import { Chip8State, Chip8 } from "./chip8.js";
import { Window } from "./window.js";
import { Romdata } from "./Romdata.js";

function main(arrBuf: ArrayBuffer): number {
  const myConf: Config = initConfig();

  const uint8View = new Uint8Array(arrBuf);
  const romData = new Romdata(uint8View);
  console.log(romData.dump()); // Debug output

  const win = new Window(myConf);
  win.clearscreen();

  const chip8 = new Chip8(Chip8State.Running, myConf, win);
  chip8.load(romData);

  let timer = 0;

  // Main emulator loop
  function emuLoop() {
    timer++;
    if (chip8.state !== Chip8State.Quit) {
      try {
        chip8.emulate_instruction();
      } catch (error) {
        console.log(error);
      }

      if (timer % 5 == 0) {
        chip8.emulateTimers();
        timer = 0;
      }
      chip8.draw();
    }
    setTimeout(emuLoop, 16);
  }

  // Start the emulator loop
  emuLoop();
  return 0;
}

export { main };
