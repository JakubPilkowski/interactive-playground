import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { connectionMode, moveMode } from "./modes";

import {
  IConnectionState,
  IMode,
  IModeType,
  IPlayground,
  ModeType,
} from "./Playground";

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
    setByType: (state, action: PayloadAction<IPlaygroundSetByTypePayload>) => {
      const index = state.modes.findIndex(
        (mode) => mode.type === action.payload.type
      );
      if (index !== -1) {
        state.currentMode = state.modes[index];
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

export type IPlaygroundSetPayload = {
  mode: IMode;
};

export type IPlaygroundSetByTypePayload = {
  type: IModeType;
};

export type IPlaygroundSetByShortcutPayload = {
  key: string;
};

export type IPlaygroundChangeDisabilityPayload = {
  isChangeDisabled: boolean;
};

export type IPlaygroundChangeConnectionStatePayload = {
  newState: IConnectionState;
};

export const {
  set: setMode,
  setByType: setModeByType,
  setByShortcut: setModeByShortcut,
  changeDisability: changeModeDisability,
} = playgroundSlice.actions;

export default playgroundSlice.reducer;
