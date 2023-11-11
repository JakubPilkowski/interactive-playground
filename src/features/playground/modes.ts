import { IMode } from "./Playground";

export const moveMode: IMode = {
  name: "move",
  shortcut: "m",
  movement: {
    connections: false,
    nodes: true,
    playground: true,
  },
};

export const connectionMode: IMode = {
  name: "connection",
  shortcut: "c",
  movement: {
    connections: true,
    nodes: false,
    playground: true,
  },
};
