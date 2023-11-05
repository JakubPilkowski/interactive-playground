import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import Connection from "./Connection";

const initialState: Connection[] = [
  new Connection({ source: "0", target: "1" }),
];

const connectionsSlice = createSlice({
  initialState,
  name: "connections",
  reducers: {
    create: (state, action: PayloadAction<IConnectionCreatePayload>) => {
      state.push(
        new Connection({ source: action.payload.source, target: null })
      );
    },
    update: (state, action: PayloadAction<IConnectionUpdatePayload>) => {
      const connection = action.payload.connection;
      const connectionId = connection.id;
      const index = state.findIndex(
        (connection) => connection.id === connectionId
      );
      if (index !== -1) {
        state[index] = connection.clone();
      }
    },
    release: (state, action: PayloadAction<IConnectionReleasePayload>) => {
      state.filter(({ id }) => id !== action.payload.id);
    },
  },
});

export interface IConnectionCreatePayload {
  source: string;
}

export interface IConnectionUpdatePayload {
  connection: Connection;
}

export interface IConnectionReleasePayload {
  id: string;
}

export const {
  create: createConnection,
  update: updateConnection,
  release: releaseConnection,
} = connectionsSlice.actions;

export default connectionsSlice.reducer;
