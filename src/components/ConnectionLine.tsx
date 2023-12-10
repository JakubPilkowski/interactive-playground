import { FC, useState, useCallback, useRef } from "react";
import { Line, Vector3 } from "three";
import { RootState, ThreeEvent, useFrame, useThree } from "@react-three/fiber";

import { useAppDispatch } from "app/store";

import {
  changeModeDisability,
  setModeByType,
} from "features/playground/playgroundSlice";

import Connection, {
  ConnectionState,
  IConnection,
} from "../features/connection/Connection";
import Circle, { CircleRef } from "./Circle";

import ConnectionController from "features/connection/ConnectionController";
import Pointer from "core/Pointer";
import Highlighter from "core/Highlighter";
import {
  releaseConnection,
  updateConnection,
} from "features/connection/connectionsSlice";

interface IProps {
  connection: IConnection;
}

const highlighter = new Highlighter();

// let _controller: ConnectionController;

const ConnectionLine: FC<IProps> = ({ connection }) => {
  const { scene, camera } = useThree();
  const dispatch = useAppDispatch();
  // TODO: setController is probably redundant, we can create controller on mouseDown
  const [controller, setController] = useState(
    new ConnectionController(scene, camera, new Connection(connection))
  );

  const ref = useRef<Line>(null);
  const startCircleRef = useRef<CircleRef>(null);
  const endCircleRef = useRef<CircleRef>(null);

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
    startCircleRef.current?.position.set(sourceX, sourceY, sourceZ);
    endCircleRef.current?.position.set(targetX, targetY, targetZ);
  }, [connection, scene]);

  const handleMove = useCallback(
    (state: RootState) => {
      if (controller.state === "idle") return;
      const line = ref.current;
      if (!line) return;

      const sourceAnchor = controller.sourceAnchor;
      const targetAnchor = controller.targetAnchor;
      const destination = controller.destination;
      if (!destination) return;
      const pinnedAnchor =
        destination === "source" ? targetAnchor : sourceAnchor;
      if (!pinnedAnchor) return;
      if (!targetAnchor) return;
      if (!sourceAnchor) return;

      const notPinnedCircle =
        destination === "source"
          ? startCircleRef.current
          : endCircleRef.current;

      if (!notPinnedCircle) {
        return;
      }

      const object = controller.findAnchorObjectByPoint(state.pointer);
      if (object) {
        highlighter.highlight(object);
      } else {
        const objects = highlighter.highlightObjects.filter(
          (obj) => obj.name !== pinnedAnchor.name
        );
        highlighter.unhighlight(...objects);
      }

      const vPoint = Pointer.toScreenPosition(state.pointer, camera);

      notPinnedCircle.position.set(vPoint.x, vPoint.y, vPoint.z);

      const linePoints: Vector3[] =
        destination === "source"
          ? [vPoint, targetAnchor.position]
          : [sourceAnchor.position, vPoint];

      line.geometry.setFromPoints(linePoints);
    },
    [camera, controller]
  );

  const handlePointerDown =
    (type: "source" | "target") => (event: ThreeEvent<PointerEvent>) => {
      if (controller.state === "drag") return;
      event.stopPropagation();
      highlighter.clear();
      dispatch(setModeByType({ type: "connection" }));
      dispatch(changeModeDisability({ isChangeDisabled: true }));

      setController((currController) => {
        return currController
          .setConnection(new Connection(connection))
          .setState("drag")
          .setDestination(type)
          .unsetAnchorByDestination()
          .clone();
      });
    };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    console.log(
      "🚀 ~ file: ConnectionLine.tsx:132 ~ handlePointerUp ~ controller:",
      controller.state
    );
    if (controller.state === "idle") return;
    const sourceAnchor = controller.sourceAnchor;
    const targetAnchor = controller.targetAnchor;
    const notPinnedAnchorType = controller.destination;
    if (!notPinnedAnchorType) return;
    const pinnedAnchor =
      notPinnedAnchorType === "source" ? targetAnchor : sourceAnchor;
    if (!pinnedAnchor) return;
    if (!targetAnchor) return;
    if (!sourceAnchor) return;

    const pointer = Pointer.fromMousePosition(event.clientX, event.clientY);

    const object = controller.findAnchorObjectByPoint(pointer.p);

    if (object && object.name !== pinnedAnchor.name) {
      const connection = controller
        .setAnchorByDestination(object)
        .connection?.unparse();

      if (connection) {
        dispatch(
          updateConnection({
            connection,
          })
        );
      }
    } else {
      dispatch(releaseConnection({ id: controller.connection?.id || "" }));
    }

    // clear controller after mouse up
    highlighter.clear();
    setController(controller.clear().clone());
    dispatch(changeModeDisability({ isChangeDisabled: false }));
  };

  useFrame((state) => {
    handleMove(state);
    updatePosition();
  });

  return (
    <>
      <Circle
        ref={startCircleRef}
        onPointerDown={handlePointerDown("source")}
        onPointerUp={handlePointerUp}
      />
      <threeLine ref={ref}>
        <bufferGeometry />
        <lineBasicMaterial color="orange" linewidth={5} />
      </threeLine>
      <Circle
        ref={endCircleRef}
        onPointerDown={handlePointerDown("target")}
        onPointerUp={handlePointerUp}
      />
    </>
  );
};

export default ConnectionLine;
