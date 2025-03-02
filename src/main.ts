import { initConfig, type Config } from "./config.js";
import { sleep } from "./utilities.js";
import { Chip8State, Chip8 } from "./chip8.js";
import { Window } from "./window.js";
import { Romdata } from "./Romdata.js";

function main(arrBuf: ArrayBuffer): number {
  const myConf: Config = initConfig();

  const uint8View = new Uint8Array(arrBuf);
  const romData = new Romdata(uint8View); // data contains decoded big endian bytes of instruvtions
  console.log(romData.dump()); // note could be broken

  const win = new Window(myConf); // could throw error
  win.clear(myConf);
  const chip8 = new Chip8(Chip8State.Running, myConf, win);
  chip8.load(romData);
  chip8.draw();
  chip8.emulate_instruction();
  chip8.draw();
  chip8.emulate_instruction();
  chip8.draw();
  chip8.emulate_instruction();
  chip8.draw();
  chip8.emulate_instruction();
  chip8.draw();
  chip8.emulate_instruction(); // should draw
  chip8.draw();
  chip8.emulate_instruction();

  //while (chip8.state != Chip8State.Quit) {
  //  //window.handle_input();
  //  try {
  //    chip8.emulate_instruction();
  //  } catch (error) {
  //    console.log(error);
  //  }
  //  //sleep(16);
  //  //chip8.draw();
  //}

  return 0;
}

export { main };
