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

  dump() {
    let lines = [];

    for (let i = 0; i < this.data.length; i += 8) {
      const address = (i * 2).toString(16).padStart(6, "0");
      const block = this.data.slice(i, i + 8);
      const hexString = block
        .map(value => value.toString(16).padStart(4, "0"))
        .join(" ");

      lines.push(`${address} ${hexString}`);
    }

    return lines.join("\n");
  }
}

export { Romdata };
