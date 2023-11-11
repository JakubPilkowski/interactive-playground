import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import nodeSlice from "../features/nodes/nodeSlice";
import connectionsSlice from "../features/connection/connectionsSlice";
import playgroundSlice from "../features/playground/playgroundSlice";

const store = configureStore({
  reducer: {
    nodes: nodeSlice,
    connections: connectionsSlice,
    playground: playgroundSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
