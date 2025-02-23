const canvas = document.querySelector(".canvas");
interface Config {
  windowHeight: number;
  windowWidth: number;
  forgroundColor: string;
  backgroundColor: string;
  scaleFactor: number;
}

function config(): Config {
  const myConf: Config = {
    windowHeight: 64,
    windowWidth: 32,
    forgroundColor: "#33ff66", // green
    backgroundColor: "#000000", // black
    scaleFactor: 15
  };
  return myConf;
}

function main() {
  const myConf: Config = config();

  return 0;
}

main();
