import { ConnectionType, IMode, ModeType } from "./Playground";

export const moveMode: IMode = {
  type: "move",
  name: ModeType.move,
  shortcut: "m",
  movement: {
    connections: false,
    nodes: true,
    playground: true,
  },
  isChangeDisabled: false,
};

export const connectionMode: IMode = {
  type: "connection",
  name: ModeType.connection,
  shortcut: "c",
  movement: {
    connections: true,
    nodes: false,
    playground: false,
  },
  isChangeDisabled: false,
  connectionState: {
    type: ConnectionType.IDLE,
  },
};
