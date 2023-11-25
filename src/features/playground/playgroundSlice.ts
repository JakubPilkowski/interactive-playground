import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { connectionMode, moveMode } from "./modes";

import { IConnectionState, IMode, IPlayground, ModeType } from "./Playground";

const playgroundSlice = createSlice({
  initialState: {
    modes: [moveMode, connectionMode],
    currentMode: moveMode,
  } as IPlayground,
  name: "playground",
  reducers: {
    set: (state, action: PayloadAction<IPlaygroundSetPayload>) => {
      // if change is disabled then end action
      if (state.currentMode.isChangeDisabled) {
        return state;
      }
      const newMode = action.payload.mode;
      if (state.currentMode.name !== newMode.name) {
        state.currentMode = newMode;
      }
    },
    setByShortcut: (
      state,
      action: PayloadAction<IPlaygroundSetByShortcutPayload>
    ) => {
      // if change is disabled then end action
      if (state.currentMode.isChangeDisabled) {
        return state;
      }
      const key = action.payload.key;
      // same mode -> end action
      if (state.currentMode.shortcut === key) {
        return state;
      }
      const newMode = state.modes.find((mode) => mode.shortcut === key);
      if (newMode) {
        state.currentMode = newMode;
      }
    },
    changeDisability: (
      state,
      action: PayloadAction<IPlaygroundChangeDisabilityPayload>
    ) => {
      state.currentMode.isChangeDisabled = action.payload.isChangeDisabled;
    },
    changeConnectionState: (
      state,
      action: PayloadAction<IPlaygroundChangeConnectionStatePayload>
    ) => {
      if (state.currentMode.type !== ModeType.connection) {
        return state;
      }
      state.currentMode.connectionState = action.payload.newState;
    },
  },
});

export interface IPlaygroundSetPayload {
  mode: IMode;
}

export interface IPlaygroundSetByShortcutPayload {
  key: string;
}

export interface IPlaygroundChangeDisabilityPayload {
  isChangeDisabled: boolean;
}

export interface IPlaygroundChangeConnectionStatePayload {
  newState: IConnectionState;
}

export const {
  set: setMode,
  setByShortcut: setModeByShortcut,
  changeDisability: changeModeDisability,
} = playgroundSlice.actions;

export default playgroundSlice.reducer;
