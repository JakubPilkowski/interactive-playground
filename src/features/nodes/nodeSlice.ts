import { PayloadAction, createSlice } from "@reduxjs/toolkit";

/**
 * TODO: implement diffrent connection state
 */
export interface IConnection {
  type: "DRAG";
  target: null;
}

// export interface ICon

export interface INode {
  id: string;
  x: number;
  y: number;
  connectedTo: number | null;
}

export interface INodeAddAction extends Pick<INode, "x" | "y"> {}

export interface INodeMoveAction extends Pick<INode, "id"> {
  position: Pick<INode, "x" | "y">;
}

export interface INodeConnectAction extends Pick<INode, "id"> {
  connectTo: number;
}

export interface INodeRemoveAction extends Pick<INode, "id"> {}

const initialState: INode[] = [
  { id: "0", x: -2, y: 0, connectedTo: 1 },
  { id: "1", x: 2, y: 0, connectedTo: null },
];

export const nodeSlice = createSlice({
  name: "node",
  initialState,
  reducers: {
    add: (state, action: PayloadAction<INodeAddAction>) => {
      const position = action.payload;
      const newId = String(state.length);
      state.push({ id: newId, connectedTo: null, ...position });
    },
    move: (state, action: PayloadAction<INodeMoveAction>) => {
      const newPosition = action.payload.position;
      const id = action.payload.id;
      const index = state.findIndex((node) => node.id === id);
      if (index !== -1) {
        const node = state[index];
        state[index] = { ...node, ...newPosition };
      }
      // if (index !== -1) state.value[index] = { id, ...newPosition };
    },
    connect: (state, action: PayloadAction<INodeConnectAction>) => {
      const connectTo = action.payload.connectTo;
      const id = action.payload.id;
      const index = state.findIndex((node) => node.id === id);
      if (index !== -1) state[index].connectedTo = connectTo;
    },
    remove: (state, action: PayloadAction<INodeRemoveAction>) => {
      state.filter(({ id }) => id !== action.payload.id);
    },
  },
});

export const { add, remove, move, connect } = nodeSlice.actions;

export default nodeSlice.reducer;
