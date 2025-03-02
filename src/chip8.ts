import { FONT } from "./constants.js";
import { Romdata } from "./Romdata.js";
import type { Config } from "./config.js";
import type { Window } from "./window.js";

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
  display: boolean[]; // 64 by 32 array where each pixel is on or off
  stack: Uint16Array; // stack of size 12 whaere each rlment is 16 bytes
  pc: number; // 16 bit program counter
  delayTimer: number; // 8 bit delay timer
  soundTimer: number; // an 8 bit sound timer
  keypad: boolean[]; // 16 boolean hex keys
  //inst: InstructionFormat; // currently executing instruction
  V: Uint8Array; // 8 bit 16 genearal purpose register
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
  config: Config;
  win: Window;

  constructor(
    state: Chip8State = Chip8State.Running,
    cfg: Config,
    win: Window
  ) {
    this.state = state;
    this.win = win;
    this.machine = {
      ram: new Uint8Array(4096),
      display: new Array(64 * 32).fill(false),
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
    this.config = cfg;
  }

  //draw2() {
  //  const width = this.config.windowWidth;
  //  const scaleFactor = this.config.scaleFactor;
  //
  //  this.win.ctx!.fillStyle = "black";
  //  this.win.ctx!.fillRect(0, 0, width, this.win.height);
  //
  //  const rect = {
  //    x: 0,
  //    y: 0,
  //    w: scaleFactor,
  //    h: scaleFactor
  //  };
  //  // loop over the display array and if it is on draw
  //  for (let i = 0; i < this.machine.display.length; i++) {
  //    // Translate 1D index i value to 2D X/Y coordinates
  //    // X = i % window width
  //    // Y = i / window width note: should be integer
  //    //
  //    // scaleFactor due to remember 0 and 1
  //    rect.x = (i % width) * scaleFactor;
  //    rect.y = Math.floor(i / width) * scaleFactor;
  //
  //    // if the pixel is on then draw forground color
  //    if (this.machine.display[i]) {
  //      this.win.ctx!.fillStyle = this.config.forgroundColor;
  //    } else {
  //      this.win.ctx!.fillStyle = this.config.backgroundColor;
  //    }
  //    this.win.ctx!.fillRect(rect.x, rect.y, rect.w, rect.h);
  //  }
  //}

  draw() {
    const {
      windowWidth: width,
      windowHeight: height,
      scaleFactor,
      forgroundColor,
      backgroundColor
    } = this.config;
    const ctx = this.win.ctx!;

    // Clear the canvas before drawing
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width * scaleFactor, height * scaleFactor);

    // Draw pixels
    for (let i = 0; i < this.machine.display.length; i++) {
      // Translate 1D index i value to 2D X/Y coordinates
      // X = i % window width
      // Y = i / window width note: should be integer
      const x = (i % width) * scaleFactor;
      const y = Math.floor(i / width) * scaleFactor;

      // if the pixel is on then draw forground color
      if (this.machine.display[i]) {
        ctx.fillStyle = forgroundColor;
        ctx.fillRect(x, y, scaleFactor, scaleFactor);
      }
    }
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

  debug() {
    console.log(
      `${this.machine.pc.toString(16)} : ${this.inst.opcode.toString(16)}`
    );
  }

  emulate_instruction() {
    // FFFF
    // 1NNN

    this.inst.opcode = this._fetch();

    // pre increment pc for the next instruction
    this._increment_pc();
    this.debug();

    //fill out the current instruction format
    this.inst.NNN = this.inst.opcode & 0x0fff; // last 12 bits
    this.inst.NN = this.inst.opcode & 0x00ff; // last 8 bits
    this.inst.N = this.inst.opcode & 0x000f; // only last 4 bits
    this.inst.X = (this.inst.opcode >> 8) & 0x0f; // shift by 8 and get the last 4 bits
    this.inst.Y = (this.inst.opcode >> 4) & 0x0f; // shift by 4 and get the last 4 bits

    // get the msb 4 bits
    // emulate the opcode
    switch ((this.inst.opcode >> 12) & 0x0f) {
      case 0x00:
        // clear the screen
        if (this.inst.NN == 0xe0) {
          // reset the display array to false
          this.machine.display = new Array(64 * 32).fill(false);
        }
        break;

      case 0x01:
        // Jumps to address NNN.
        this.machine.pc = this.inst.NNN;
        break;

      case 0x06:
        // Sets VX to NN
        this.machine.V[this.inst.X] = this.inst.NN;
        break;

      case 0x07:
        // Adds NN to VX (carry flag is not changed)
        this.machine.V[this.inst.X] += this.inst.NN;
        break;

      case 0x0a:
        // Sets I to the address NNN
        this.machine.I = this.inst.NNN;
        break;

      case 0x0d:
        // Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels
        // Each row of 8 pixels is read as bit-coded starting from memory location I;
        // I value does not change after the execution of this instruction.
        // As described above, VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that does not happen.

        let xCoord = this.machine.V[this.inst.X] % this.config.windowWidth;
        const orgX = xCoord;
        let yCoord = this.machine.V[this.inst.Y] % this.config.windowHeight;

        // initailize the carry flag to zero
        this.machine.V[0x0f] = 0;

        for (let i = 0; i < this.inst.N; i++) {
          const spriteData = this.machine.ram[this.machine.I + i];
          xCoord = orgX;

          for (let j = 7; j >= 0; j--) {
            // 1d to 2d mapping
            // since the display is a one dimensional flattedned array
            const pixel: boolean =
              this.machine.display[yCoord * this.config.windowWidth + xCoord];

            // 0 or 1
            const spriteBit: number = spriteData & (1 << j) ? 1 : 0;

            // is pixel is on and spritebit is also on
            // set the caryy flag to 1
            if (pixel && spriteBit) {
              this.machine.V[0x0f] = 1;
            }

            //this.machine.display[yCoord * this.config.windowWidth + xCoord] ^=
            //  pixel;
            this.machine.display[yCoord * this.config.windowWidth + xCoord] =
              !!(
                Number(
                  this.machine.display[
                    yCoord * this.config.windowWidth + xCoord
                  ]
                ) ^ (spriteBit ? 1 : 0)
              );

            if (++xCoord >= this.config.windowWidth) break;
          }

          if (++yCoord >= this.config.windowHeight) break;
        }
        break;

      default:
        this.state = Chip8State.Quit;
        console.log(
          "Setting state to Quit due to unimplemented opcode: ",
          this.inst.opcode.toString(16)
        );
        throw new Error("unimplemented opcode");
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
}

export { Chip8State, Chip8 };
