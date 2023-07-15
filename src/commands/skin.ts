// Expiremental shit + will also only work on Kitty terminal afiak

import { ColorCode, Skin } from "teeworlds-utilities";
import { ServerData, commandHandler, getData } from "..";
import { getServerClient } from "../utils";
import path from "path";
import { unlinkSync } from "fs";
import { execSync } from "child_process";

commandHandler.register("skin", skin, {});

export async function skin(args: string[]) {
  if (!args[0]) {
    console.log("bla bla bla expected usage and shit");
    return;
  }

  let data = (await getData("server")) as ServerData;

  let p = getServerClient(data, args[0]);

  if (!p) {
    console.log(`${args[0]} is not online.`);
    return;
  }

  let baseUrl = "https://ddnet.org/skins/skin/community";

  let skin = new Skin();

  try {
    await skin.load(`${baseUrl}/${p!.skin.name}.png`);
  } catch (_) {
    console.error("This skin is invalid.");
    return;
  }

  if (p.skin.color_body && p.skin.color_feet) {
    skin.colorTee(
      new ColorCode(p.skin.color_body),
      new ColorCode(p.skin.color_feet)
    );
  }

  skin.render().saveRenderAs(`${p.skin.name}.png`);

  let rendered = path.join(__dirname, "..", "..", `${p.skin.name}.png`);

  let cmd = `kitty +kitten icat ${rendered}`;

  execSync(cmd, { stdio: "inherit" });

  // Deleting too soon will cause kitty to not display image properly? gr
  setTimeout(() => {
    unlinkSync(rendered);
  }, 500);
}
