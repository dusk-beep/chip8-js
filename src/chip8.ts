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
    // FFFF
    // 1NNN

    this.inst.opcode = this._fetch();

    // pre increment pc for the next instruction
    //this._increment_pc();
    //this.debug();

    //fill out the current instruction format
    this.inst.NNN = this.inst.opcode & 0x0fff; // last 12 bits
    this.inst.NN = this.inst.opcode & 0x00ff; // last 8 bits
    this.inst.N = this.inst.opcode & 0x000f; // only last 4 bits
    this.inst.X = (this.inst.opcode >> 8) & 0x0f; // shift by 8 and get the last 4 bits
    this.inst.Y = (this.inst.opcode >> 4) & 0x0f; // shift by 4 and get the last 4 bits

    let msg: string = "";
    // get the msb 4 bits
    // emulate the opcode
    switch ((this.inst.opcode >> 12) & 0x0f) {
      case 0x00:
        // clear the screen
        if (this.inst.NN == 0xe0) {
          // reset the display array to false
          msg = "cleared the screen";
        }
        break;

      case 0x01:
        // Jumps to address NNN.
        msg = `move pc form${this.machine.pc.toString(16)} to ${this.inst.NNN.toString(16)}`;
        break;

      case 0x02:
        // Calls subroutine at NNN.[24
        // push the current pc to top of stack
        // stackPtr is initailized to -1
        //
        msg = `incrmenet stackptr and jump to nnn ${this.machine.stackPtr} `;
        break;

      case 0x03:
        // Skips the next instruction if VX equals NN (usually the next instruction is a jump to skip a code block)
        msg = `skip next instruction if ${this.machine.V[this.inst.X]} == ${this.inst.NN}`;
        break;

      case 0x04:
        // Skips the next instruction if VX equals NN (usually the next instruction is a jump to skip a code block)
        msg = `skip next instruction if ${this.machine.V[this.inst.X]} != ${this.inst.NN}`;
        break;

      case 0x05:
        // Skips the next instruction if VX equals VY (usually the next instruction is a jump to skip a code block)
        msg = `skip next instruction if ${this.machine.V[this.inst.X]} == ${this.machine.V[this.inst.Y]}`;
        break;

      case 0x06:
        // Sets VX to NN
        msg = `sets  VX  to ${this.inst.NN.toString(16)}`;
        break;

      case 0x07:
        // Adds NN to VX (carry flag is not changed)
        //this.machine.V[this.inst.X] += this.inst.NN;
        msg = `adds ${this.inst.NN} to ${this.machine.V[this.inst.X]} `;
        break;

      case 0x09:
        // Skips the next instruction if VX not equals VY (usually the next instruction is a jump to skip a code block)
        msg = `skip next instruction if ${this.machine.V[this.inst.X]} != ${this.machine.V[this.inst.Y]}`;
        break;

      case 0x0a:
        // Sets I to the address NNN
        //this.machine.I = this.inst.NNN;
        msg = `sets I to ${this.inst.NNN}`;
        break;

      case 0x0d:
        // Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels
        // Each row of 8 pixels is read as bit-coded starting from memory location I;
        // I value does not change after the execution of this instruction.
        // As described above, VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that does not happen.
        msg = `draw from ${this.machine.V[this.inst.X].toString(16)},${this.machine.V[this.inst.Y].toString(16)}: ${this.inst.N.toString(16)} byte long sprite `;

        break;

      default:
        //this.state = Chip8State.Quit;
        //console.log(
        //  "Setting state to Quit due to unimplemented opcode: ",
        //  this.inst.opcode.toString(16)
        //);
        //throw new Error("unimplemented opcode");
        break;
    }
    console.log(
      `${this.inst.opcode.toString(16)} : ${this.machine.pc.toString(16)} :${msg} `
    );
  }

  emulate_instruction() {
    // FFFF
    // 1NNN

    this.inst.opcode = this._fetch();

    //fill out the current instruction format
    this.inst.NNN = this.inst.opcode & 0x0fff; // last 12 bits
    this.inst.NN = this.inst.opcode & 0x00ff; // last 8 bits
    this.inst.N = this.inst.opcode & 0x000f; // only last 4 bits
    this.inst.X = (this.inst.opcode >> 8) & 0x0f; // shift by 8 and get the last 4 bits
    this.inst.Y = (this.inst.opcode >> 4) & 0x0f; // shift by 4 and get the last 4 bits

    // pre increment pc for the next instruction
    this.debug();
    this._increment_pc();

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

      case 0x02:
        // Calls subroutine at NNN.[24
        // push the current pc to top of stack
        // stackPtr is initailized to -1
        this.machine.stack[this.machine.stackPtr++] = this.machine.pc;
        this.machine.pc = this.inst.NNN;

        break;

      case 0x03:
        // Skips the next instruction if VX equals NN (usually the next instruction is a jump to skip a code block)
        if (this.machine.V[this.inst.X] == this.inst.NN) {
          this._increment_pc();
        }
        break;

      case 0x04:
        // Skips the next instruction if VX NOT equals NN (usually the next instruction is a jump to skip a code block)
        if (this.machine.V[this.inst.X] != this.inst.NN) {
          this._increment_pc();
        }
        break;

      case 0x05:
        // Skips the next instruction if VX  equals VY (usually the next instruction is a jump to skip a code block)
        if (this.machine.V[this.inst.X] == this.machine.V[this.inst.Y]) {
          this._increment_pc();
        }
        break;

      case 0x06:
        // Sets VX to NN
        this.machine.V[this.inst.X] = this.inst.NN;
        break;

      case 0x07:
        // Adds NN to VX (carry flag is not changed)
        this.machine.V[this.inst.X] += this.inst.NN;
        break;

      case 0x09:
        // Skips the next instruction if VX NOT equals VY (usually the next instruction is a jump to skip a code block)
        if (this.machine.V[this.inst.X] != this.machine.V[this.inst.Y]) {
          this._increment_pc();
        }
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

            // pixel is on and spritebit is also on
            // set the caryy flag to 1
            if (pixel && spriteBit) {
              this.machine.V[0x0f] = 1;
            }

            //this.machine.display[yCoord * this.config.windowWidth + xCoord] ^=
            //  pixel;
            this.machine.display[yCoord * this.config.windowWidth + xCoord] =
              Boolean(
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
