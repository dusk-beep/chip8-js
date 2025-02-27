class Romdata {
  data: number[];

  constructor(rom: Uint8Array) {
    this.data = [];

    for (let i = 0; i < rom.length; i += 2) {
      // convert to big endian(msb forst)
      // eg
      // 0x32 => 0x3200 or 0x23 => 0x3223
      this.data.push((rom[i] << 8) | (rom[i + 1] << 0));
    }
  }
}

export { Romdata };
