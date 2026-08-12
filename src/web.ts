import { main } from "./main.js";

const select = document.querySelector<HTMLSelectElement>("#select");

if (!select) {
  throw new Error("ROM selector not found");
}

async function loadRom() {
  const rom = select.value;

  try {
    const resp = await fetch(`./roms/${rom}`);

    if (!resp.ok) {
      throw new Error(
        `Failed to load ROM: ${resp.status} ${resp.statusText}`
      );
    }

    const arrayBuffer = await resp.arrayBuffer();

    if (main(arrayBuffer)) {
      throw new Error("unexpected error occurred in main loop");
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadRomList() {
  try {
    const response = await fetch("./roms/manifest.json",{
      headers: {
        "Accept":"application/json"
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to load ROM list: ${response.status} ${response.statusText}`
      );
    }

    if (!response.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Server returned something other than JSON");
    }


    const roms: string[] = await response.json();

    for (const rom of roms) {
      const option = document.createElement("option");

      option.value = rom;
      option.textContent = rom;

      select.appendChild(option);
    }
  } catch (error) {
    console.error("Could not load ROM list:", error);
  }
}

select.addEventListener("change", loadRom);

loadRomList();
