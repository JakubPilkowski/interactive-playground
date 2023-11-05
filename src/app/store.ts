import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import nodeSlice from "../features/nodes/nodeSlice";
import connectionsSlice from "../features/connection/connectionsSlice";

const store = configureStore({
  reducer: {
    nodes: nodeSlice,
    connections: connectionsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
