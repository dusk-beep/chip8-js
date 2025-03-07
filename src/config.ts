interface Config {
  windowHeight: number;
  windowWidth: number;
  forgroundColor: string;
  backgroundColor: string;
  scaleFactor: number;
}

function initConfig(): Config {
  const myConf: Config = {
    windowWidth: 64,
    windowHeight: 32,
    forgroundColor: "#33ff66", // green #33ff66
    backgroundColor: "black", // black
    scaleFactor: 5
  };
  return myConf;
}

export { initConfig, type Config };
