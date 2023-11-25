/// <reference types="vite/client" />

import { Object3DNode } from "@react-three/fiber";
import { Line } from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      threeLine: Object3DNode<Line, typeof Line>;
    }
  }
}
