import { main } from "./main.js";

async function loadrom(event: Event) {
  if (!event.target) return;
  const rom = event.currentTarget;
  try {
    const resp = await fetch(`./rom/${rom}`);
    const arrayBuffer = await resp.arrayBuffer();

    if (main(arrayBuffer)) throw Error("unexpected error occured in main loop");
  } catch (error) {
    console.log(error);
  }
}

const selected = document.querySelector("select");
if (!selected) throw Error("no rom selected");
selected.addEventListener("change", loadrom);
