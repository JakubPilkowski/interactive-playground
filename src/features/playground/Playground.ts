import ConnectionController from "../connection/ConnectionController";

export type IEntityMove = boolean;

export interface IPanelMovement {
  nodes: IEntityMove;
  connections: IEntityMove;
  playground: IEntityMove;
}

export const ModeType = {
  move: "move",
  connection: "connection",
} as const;

export type IModeType = keyof typeof ModeType;

export interface IMoveMode {
  type: "move";
  name: string;
  shortcut: string;
  movement: IPanelMovement;
  isChangeDisabled: boolean;
}

export const ConnectionType = {
  IDLE: "IDLE",
  DRAGGING: "DRAGGING",
} as const;

export interface IIdleConnection {
  type: (typeof ConnectionType)["IDLE"];
}

export interface IDraggingConnection {
  type: (typeof ConnectionType)["DRAGGING"];
  controller: ConnectionController;
}

export type IConnectionState = IIdleConnection | IDraggingConnection;

export interface IConnectionMode {
  type: "connection";
  name: string;
  shortcut: string;
  movement: IPanelMovement;
  isChangeDisabled: boolean;
  connectionState: IConnectionState;
}

export type IMode = IMoveMode | IConnectionMode;

// export interface ICurrentMode extends IMode {
//   isChangeDisabled: boolean;
// }

export interface IPlayground {
  currentMode: IMode;
  modes: IMode[];
}
