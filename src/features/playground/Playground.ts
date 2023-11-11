export type IEntityMove = boolean;

export interface IPanelMovement {
  nodes: IEntityMove;
  connections: IEntityMove;
  playground: IEntityMove;
}

export interface IMode {
  name: string;
  shortcut: string;
  movement: IPanelMovement;
}

export interface ICurrentMode extends IMode {
  isChangeDisabled: boolean;
}

export interface IPlayground {
  currentMode: ICurrentMode;
  modes: IMode[];
}
