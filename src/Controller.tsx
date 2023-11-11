import { FC, ReactNode, memo } from "react";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Vector3 } from "three";

import { useAppDispatch } from "./app/store";

import { add } from "./features/nodes/nodeSlice";
import { setMode } from "./features/playground/playgroundSlice";

import {
  AddNodeEventHandler,
  MoveToNodeEventHandler,
  SetModeEventHandler,
} from "./Panel";

import "./controller.css";

interface IProps {
  children: (callbacks: {
    onAdd: AddNodeEventHandler;
    onMove: MoveToNodeEventHandler;
    onModeSet: SetModeEventHandler;
  }) => ReactNode;
}

const Controller: FC<IProps> = ({ children }) => {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);

  const dispatch = useAppDispatch();

  const onAdd = () => {
    dispatch(add({ x: camera.position.x, y: camera.position.y }));
  };

  const onMove: MoveToNodeEventHandler = (node) => {
    if (!controls) return;
    camera.position.set(node.x, node.y, camera.position.z);
    // camera.position.lerp(new Vector3(node.x, node.y, camera.position.z), 0.5);
    camera.updateProjectionMatrix();
    // TODO: add typing
    controls.target = new Vector3(node.x, node.y, 0);
    controls.update();
  };

  const onModeSet: SetModeEventHandler = (mode) => {
    dispatch(setMode({ mode }));
  };

  return (
    <Html prepend wrapperClass="panel">
      {children({ onAdd, onMove, onModeSet })}
      {/* <button onClick={addButton}>Add new box</button>
      <div>
        <p>Move to</p>
        {nodes.map((node) => (
          <button key={node.id} onClick={moveTo(node)}>
            Move to {node.id}
          </button>
        ))}
      </div> */}
    </Html>
  );
};

export default memo(Controller);
