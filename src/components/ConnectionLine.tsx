import { FC, useState, useCallback, useRef } from "react";
import { Line } from "three";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";

import {
  ConnectionState,
  IConnection,
} from "../features/connection/Connection";
import Anchor, { AnchorRef } from "./Anchor";

import ConnectionController from "features/connection/ConnectionController";
import Pointer from "core/Pointer";

interface IProps {
  connection: IConnection;
}

const ConnectionLine: FC<IProps> = ({ connection }) => {
  const { scene, camera } = useThree();

  const [controller, setController] = useState(
    new ConnectionController(scene, camera, null)
  );

  const ref = useRef<Line>(null);
  const startAnchorRef = useRef<AnchorRef>(null);
  const endAnchorRef = useRef<AnchorRef>(null);

  const updatePosition = useCallback(() => {
    const { source, target, state } = connection;
    if (state !== ConnectionState.ACTIVE || !source || !target) {
      return;
    }
    const sourceElem = scene.getObjectByName(source);
    const targetElem = scene.getObjectByName(target);
    if (!sourceElem || !targetElem || !ref.current) return;
    const points = [sourceElem.position, targetElem.position];
    ref.current.geometry.setFromPoints(points);
    const { x: sourceX, y: sourceY, z: sourceZ } = sourceElem.position;
    const { x: targetX, y: targetY, z: targetZ } = targetElem.position;
    startAnchorRef.current?.position.set(sourceX, sourceY, sourceZ);
    endAnchorRef.current?.position.set(targetX, targetY, targetZ);
  }, [connection, scene]);

  const handleAnchorDown =
    (type: "source" | "target") => (event: ThreeEvent<PointerEvent>) => {
      // if (controller.state === "drag") return;
      // highlighter.clear();
      console.log(event.pointer.x);
      console.log(event.pointer.y);
      console.log(event.clientX);
      console.log(event.clientY);
      const pointer = Pointer.fromMousePosition(event.clientX, event.clientY);
      console.log(pointer.p.x, pointer.p.y);
      // const object = controller.findAnchorObjectByPoint(pointer.p);

      // if (object) {
      //   setController(
      //     controller.setSourceAnchor(object).setState("drag").clone()
      //   );
      //   highlighter.highlight(object);
      //   dispatch(changeModeDisability({ isChangeDisabled: true }));
      // } else {
      //   setController(controller.clear().clone());
      // }
    };

  useFrame(() => {
    updatePosition();
  });

  return (
    <>
      <Anchor ref={startAnchorRef} onPointerDown={handleAnchorDown("source")} />
      <threeLine ref={ref}>
        <bufferGeometry />
        <lineBasicMaterial color="orange" linewidth={5} />
      </threeLine>
      <Anchor ref={endAnchorRef} onPointerDown={handleAnchorDown("target")} />
    </>
  );
};

export default ConnectionLine;
