import { initConfig, type Config } from "./config.js";
import { sleep } from "./utilities.js";
import { Chip8State, Chip8 } from "./chip8.js";
import { Window } from "./window.js";

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
