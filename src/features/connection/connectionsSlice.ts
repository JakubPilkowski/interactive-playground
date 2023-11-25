import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { ConnectionState, IConnection } from "./Connection";

const initialState: IConnection[] = [
  { id: "0", state: ConnectionState.ACTIVE, source: "0", target: "1" },
];

const connectionsSlice = createSlice({
  initialState,
  name: "connections",
  reducers: {
    create: (state, action: PayloadAction<IConnectionCreatePayload>) => {
      state.push(action.payload.connection);
    },
    update: (state, action: PayloadAction<IConnectionUpdatePayload>) => {
      const connection = action.payload.connection;
      const connectionId = connection.id;
      const index = state.findIndex(
        (connection) => connection.id === connectionId
      );
      if (index !== -1) {
        state[index] = connection;
      }
    },
    release: (state, action: PayloadAction<IConnectionReleasePayload>) => {
      state.filter(({ id }) => id !== action.payload.id);
    },
  },
});

export interface IConnectionCreatePayload {
  connection: IConnection;
}

export interface IConnectionUpdatePayload {
  connection: IConnection;
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
