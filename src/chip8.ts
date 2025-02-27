import { FONT } from "./constants.js";
import { Romdata } from "./Romdata.js";

enum Chip8State {
  Quit,
  Paused,
  Running
}

interface InstructionFormat {
  opcode: number;
  NNN: number;
  NN: number;
  N: number;
  X: number;
  Y: number;
}

interface Machine {
  ram: Uint8Array; // array of 4096 bytes
  display: boolean[][]; // 64 by 32 array where each pixel is on or off
  stack: Uint16Array; // stack of size 12 whaere each rlment is 16 bytes
  pc: number; // 16 bit program counter
  delayTimer: number; // 8 bit delay timer
  soundTimer: number; // an 8 bit sound timer
  keypad: boolean[]; // 16 boolean hex keys
  //inst: InstructionFormat; // currently executing instruction
  V: ArrayBuffer; // 16 genearal purpose register
  I: number; // index register
  stackPtr: number; // point to top of stack
}

class Chip8 {
  // every oppcode is 16 bit
  // but ram is 8 bit
  state: Chip8State;
  entryPoint: number = 0x200;
  machine: Machine;
  inst: InstructionFormat;

  constructor(state: Chip8State = Chip8State.Running) {
    this.state = state;
    this.machine = {
      ram: new Uint8Array(4096),
      display: Array.from({ length: 64 }, () => Array(32).fill(false)),
      stack: new Uint16Array(12),
      pc: this.entryPoint,
      keypad: Array(16).fill(false),
      V: new Uint8Array(16),
      I: 0,
      soundTimer: 0,
      delayTimer: 0,
      stackPtr: -1
    };
    this.inst = {
      opcode: 0,
      NN: 0,
      N: 0,
      NNN: 0,
      X: 0,
      Y: 0
    };
  }

  // load font and rom and set the initial pc to 0x200(start of rom)
  load(romData: Romdata) {
    // load the font on to memory (0x00 till 0x200 permitted)
    for (let i = 0; i < FONT.length; i++) {
      const element: number | undefined = FONT[i];
      if (!element) continue; // ts stuff
      this.machine.ram[i] = element;
    }

    // load the rom
    for (let i = 0; i < romData.data.length; i++) {
      // put the first index with the msb (big endian)
      // eg 0x3245 => 0x0032 <-> 0x32
      this.machine.ram[this.entryPoint + 2 * i] = romData.data[i] >> 8;

      // then 0x3245 => 0x0045 <-> 0x45
      this.machine.ram[this.entryPoint + 2 * i + 1] = romData.data[i] & 0x00ff;
    }

    // set the program counter also
    this.machine.pc = this.entryPoint; // ie 0x200
  }

  execute_instruction() {
    this.inst.opcode = this._fetch();
    // pre _increment_pc for the next instruction
    this._increment_pc();

    //fill out the current instruction format
    this.inst.NNN = this.inst.opcode & 0x0fff; // last 12 bits
    this.inst.NN = this.inst.opcode & 0x00ff; // last 8 bits
    this.inst.N = this.inst.opcode & 0x000f; // only last 4 bits
    this.inst.X = (this.inst.opcode >> 8) & 0x0f; // shift by 8 and get the last 4 bits
    this.inst.Y = (this.inst.opcode >> 4) & 0x0f; // shift by 4 and get the last 4 bits

    // get the msb 4 bits
    switch ((this.inst.opcode >> 12) & 0x0f) {
      case 0x00:
    }
  }

  _increment_pc() {
    this.machine.pc += 2;
  }

  _fetch() {
    if (this.machine.pc > 4094) {
      this.state = Chip8State.Quit;
      throw new Error("memory out of bounds");
    }

    return (
      (this.machine.ram[this.machine.pc] << 8) |
      (this.machine.ram[this.machine.pc + 1] << 0)
    );
  }

  emulate_instruction() {}
}

export { Chip8State, Chip8 };
