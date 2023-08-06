import { terminal } from "terminal-kit";
import { commandHandler } from "..";
import { copyFileSync, readdirSync } from "fs";
import path, { extname } from "path";
import { Gameskin, GameskinPart } from "teeworlds-utilities";

commandHandler.register("asset", asset, {});

const parts = [
  GameskinPart.GUN,
  GameskinPart.GUN_CURSOR,
  GameskinPart.GUN_AMMO,
  GameskinPart.GUN_PARTICLE_1,
  GameskinPart.GUN_PARTICLE_2,
  GameskinPart.GUN_PARTICLE_3,
  GameskinPart.SHOTGUN,
  GameskinPart.SHOTGUN_CURSOR,
  GameskinPart.SHOTGUN_AMMO,
  GameskinPart.SHOTGUN_PARTICLE_1,
  GameskinPart.SHOTGUN_PARTICLE_2,
  GameskinPart.SHOTGUN_PARTICLE_3,
  GameskinPart.GRENADE,
  GameskinPart.GRENADE_AMMO,
  GameskinPart.GRENADE_CURSOR,
  GameskinPart.LASER,
  GameskinPart.LASER_AMMO,
  GameskinPart.LASER_CURSOR,
  GameskinPart.HAMMER,
  GameskinPart.HAMMER_CURSOR,
  GameskinPart.NINJA,
  GameskinPart.NINJA_TIMER,
  GameskinPart.NINJA_CURSOR,
  GameskinPart.NINJA_PARTICLE_1,
  GameskinPart.NINJA_PARTICLE_2,
  GameskinPart.NINJA_PARTICLE_3,
  GameskinPart.ARMOR_FULL,
  GameskinPart.ARMOR_EMPTY,
  GameskinPart.MINUS,
  GameskinPart.SHIELD,
  GameskinPart.HEART,
  GameskinPart.HEALTH_FULL,
  GameskinPart.HEALTH_EMPTY,
  GameskinPart.HOOK,
  GameskinPart.FLAG_RED,
  GameskinPart.FLAG_BLUE,
  GameskinPart.STAR_1,
  GameskinPart.STAR_2,
  GameskinPart.STAR_3,
  GameskinPart.PARTICLE_1,
  GameskinPart.PARTICLE_2,
  GameskinPart.PARTICLE_3,
  GameskinPart.PARTICLE_4,
  GameskinPart.PARTICLE_5,
  GameskinPart.PARTICLE_6,
  GameskinPart.PARTICLE_7,
  GameskinPart.PARTICLE_8,
  GameskinPart.PARTICLE_9,
];

let curr = 0;
let base: Gameskin | undefined = undefined;

async function asset(args: string[]) {
  if (!args[0]) {
    terminal.red("Expected usage: tw asset <folder>");
    process.exit(0);
  }

  let files = readdirSync(args[0]).filter((x) => extname(x) == ".png");

  if (!files.length) {
    terminal.red(
      "You provided an empty folder, or a folder containing no pngs"
    );
    process.exit(0);
  }

  let loaded: { name: string; skin: Gameskin }[] = [];

  for (let i = 0; i < files.length; i++) {
    let x = new Gameskin();
    try {
      await x.load(path.join(args[0], files[i]));
      loaded.push({ name: files[i], skin: x });
      terminal.green(`Loaded: ${files[i]}\n`);
    } catch (e: any) {
      terminal.red(`Failed to load ${files[i]}\n`);
    }
  }

  let loadedNames = loaded.map((x) => x.name);

  terminal.green("\n\nWhat would you like to use as your base?\n");
  let x = await terminal.inputField({
    autoComplete: loadedNames,
    autoCompleteMenu: true,
  }).promise;

  terminal.green("\n Got " + x + "\n");

  if (!x || !loadedNames.includes(x)) {
    terminal.red("\nProvided invalid name.");
    process.exit(1);
  }

  terminal.green(`\nSelected "${x}" as base skin.\n`);

  terminal.green("\nWhat would you like to name this gameskin: ");
  let name = await terminal.inputField({}).promise;

  if (!name) {
    terminal.red("\nYou are required to provide a name.");
    process.exit(0);
  }

  copyFileSync(path.join(args[0], x), path.join(args[0], name as string));

  base = new Gameskin();
  base.load(path.join(args[0], name));

  loadedNames.push("base");

  selectPart(loaded, loadedNames, path.join(args[0], `${name}.png`));
}

async function selectPart(
  skins: { name: string; skin: Gameskin }[],
  names: string[],
  savePath: string
) {
  if (curr == parts.length) {
    terminal.green("\nFinished creating gameskin");

    base?.saveAs(savePath);
    process.exit(0);
  }
  terminal.green(`\nSelect gameskin for part ${parts[curr]}\n`);
  let x = await terminal.inputField({
    autoComplete: names,
    autoCompleteMenu: true,
  }).promise;

  if (x == "exit") {
    terminal.green("\nExitting\n");
    process.exit(1);
  }

  if (!x || !names.includes(x)) {
    terminal.red("\nProvied invalid name\n");

    selectPart(skins, names, savePath);
    return;
  }

  if (x != "base") {
    let s = skins.find((y) => y.name == x);

    base!.copyPart(s!.skin, parts[curr]);
  }
  curr++;
  selectPart(skins, names, savePath);
}
