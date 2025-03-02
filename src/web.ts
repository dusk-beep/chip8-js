import { main } from "./main.js";

async function loadrom() {
  const rom = (<HTMLSelectElement>document.getElementById("select")).value;

  try {
    const resp = await fetch(`./rom/${rom}`);
    const arrayBuffer = await resp.arrayBuffer();

    if (main(arrayBuffer)) throw Error("unexpected error occured in main loop");
  } catch (error) {
    console.log(error);
  }
}

console.log("emtry");

const selected = document.querySelector("select");
if (!selected) throw Error("no rom selected");
selected.addEventListener("change", loadrom);
