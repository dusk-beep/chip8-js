interface Config {
  windowHeight: number;
  windowWidth: number;
  forgroundColor: string;
  backgroundColor: string;
  scaleFactor: number;
}

function initConfig(): Config {
  const myConf: Config = {
    windowHeight: 64,
    windowWidth: 32,
    forgroundColor: "white", // green #33ff66
    backgroundColor: "#000000", // black
    scaleFactor: 5
  };
  return myConf;
}

export { initConfig, type Config };
