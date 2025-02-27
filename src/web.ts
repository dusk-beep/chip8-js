async function loadrom(event: Event) {
  if (!event.target) return;
  const rom = event.currentTarget;
  try {
    const resp = await fetch(`./rom/${rom}`);
    const arrayBuffer = await resp.arrayBuffer();
    const uint8View = new Uint8Array(arrayBuffer);
    console.log(uint8View);
  } catch (error) {
    console.log(error);
  }
}

const selected = document.querySelector("select");
if (!selected) throw Error("no rom selected");
selected.addEventListener("change", loadrom);
