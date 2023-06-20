#!/usr/bin/env node

import path from "path";
import { CommandHandler } from "./commandsHandler";
import { checkVersion, setupJSON } from "./utils";

export type ServerData = {
  servers: {
    info: {
      name: string;
      map: { name: string };
      clients: { name: string; clan: string; team: 0 }[];
      game_type: string;
    };
  }[];
};

export type DataTypes = ServerData;

let args = process.argv.splice(2);
let commands = ["find", "friends", "repl", "notifier"];

let serverUrl = "https://master1.ddnet.org/ddnet/15/servers.json";

export let friends = setupJSON();

let help = `
--- Teeworlds CLI ---


  commands:
    - find
      - player  (finds the server a player is on)
        [name]
      - clan    (finds all clan members servers)
        [name]
    - notifier  (start/stop the notifier interval)
      - start
      - stop
    - friends   (manage your friends)
      - add
        [name]
      - remove
        [name]
      -list
    - repl      (start the repl, recommended way to use)
`;

export let commandHandler = new CommandHandler();

async function main() {
  await checkVersion();

  if (!args.length || !commands.includes(args[0].toLowerCase())) {
    console.log(help);
    process.exit(1);
  }

  await commandHandler.loadCommands(path.join(__dirname, "commands"));
  handle(args);
}

// Turn dtype into an enum??
export async function getData(
  dType: "server" | "NOT_IMPLEMENTED"
): Promise<DataTypes | undefined> {
  if (dType == "server")
    return (await (await fetch(serverUrl)).json()) as ServerData;
}

export async function handle(
  args: string[],
  repl?: boolean
): Promise<{ success: boolean; message: string } | void> {
  return await commandHandler.run(args[0], args.splice(1), repl);
}

main();
