import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { connectionMode, moveMode } from "./modes";

import { IMode, IPlayground } from "./Playground";

const playgroundSlice = createSlice({
  initialState: {
    modes: [moveMode, connectionMode],
    currentMode: {
      ...moveMode,
      isChangeDisabled: false,
    },
  } as IPlayground,
  name: "playground",
  reducers: {
    set: (state, action: PayloadAction<IPlaygroundSetPayload>) => {
      // if change is disabled then end action
      if (state.currentMode.isChangeDisabled) {
        return;
      }
      const newMode = action.payload.mode;
      if (state.currentMode.name !== newMode.name) {
        state.currentMode = { ...state.currentMode, ...newMode };
      }
    },
    setByShortcut: (
      state,
      action: PayloadAction<IPlaygroundSetByShortcutPayload>
    ) => {
      // if change is disabled then end action
      if (state.currentMode.isChangeDisabled) {
        return;
      }
      const key = action.payload.key;
      // same mode -> end action
      if (state.currentMode.shortcut === key) {
        return;
      }
      const newMode = state.modes.find((mode) => mode.shortcut === key);
      if (newMode) {
        state.currentMode = {
          ...newMode,
          isChangeDisabled: state.currentMode.isChangeDisabled,
        };
      }
    },
    changeDisability: (
      state,
      action: PayloadAction<IPlaygroundChangeDisabilityPayload>
    ) => {
      state.currentMode.isChangeDisabled = action.payload.isChangeDisabled;
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

export const {
  set: setMode,
  setByShortcut: setModeByShortcut,
  changeDisability: changeModeDisability,
} = playgroundSlice.actions;

export default playgroundSlice.reducer;
