enum Chip8State {
  Quit,
  Paused,
  Running
}

//interface InstructionFormat {
//  opcode: number;
//  NNN: number;
//  NN: number;
//  N: number;
//  X: number;
//  Y: number;
//}

interface Machine {
  ram: ArrayBuffer; // array of 4096 bytes
  display: boolean[][]; // 64 by 32 array where each pixel is on or off
  stack: ArrayBuffer; // stack of size 12 whaere each rlment is 16 bytes
  pc: number; // 16 bit program counter
  delayTimer: number; // 8 bit delay timer
  soundTimer: number; // an 8 bit sound timer
  keypad: boolean[]; // 16 boolean hex keys
  romName: string; //loaded rom
  //inst: InstructionFormat; // currently executing instruction
  V: ArrayBuffer; // 16 genearal purpose register
  I: number; // index register
  stackPtr: number; // point to top of stack
}

class Chip8 {
  state: Chip8State;
  entryPoint: number = 0x200;
  machine: Machine;

  constructor(state: Chip8State = Chip8State.Running, romName: string) {
    this.state = state;
    this.machine = {
      ram: new Uint8Array(4096),
      display: Array.from({ length: 64 }, () => Array(32).fill(false)),
      stack: new Uint16Array(12),
      pc: this.entryPoint,
      keypad: Array(16).fill(false),
      romName: romName,
      V: new Uint8Array(16),
      I: 0,
      soundTimer: 0,
      delayTimer: 0,
      stackPtr: -1
    };
  }
}

export { Chip8State, Chip8 };
