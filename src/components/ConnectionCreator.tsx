import { FC, useEffect, useRef, useState } from "react";
import { Line } from "three";
import { useFrame, useThree } from "@react-three/fiber";

import { useAppDispatch } from "../app/store";

import { createConnection } from "../features/connection/connectionsSlice";
import { changeModeDisability } from "../features/playground/playgroundSlice";

import ConnectionController from "../features/connection/ConnectionController";
import Pointer from "../core/Pointer";
import Highlighter from "../core/Highlighter";

interface IProps {}

const highlighter = new Highlighter();

const ConnectionCreator: FC<IProps> = () => {
  const { size, viewport, scene, camera } = useThree();

  const [controller, setController] = useState(
    new ConnectionController(scene, camera, null)
  );

  const dispatch = useAppDispatch();

  const lineRef = useRef<Line>(null);

  const aspect = size.width / viewport.width;

  useFrame((state) => {
    if (controller.state === "idle") return;
    const sourceAnchor = controller.sourceAnchor;
    if (!sourceAnchor) return;
    const line = lineRef.current;
    if (!line) return;

    const object = controller.findAnchorObjectByPoint(state.pointer);
    if (object) {
      highlighter.highlight(object);
    } else {
      const objects = highlighter.highlightObjects.filter(
        (obj) => obj.name !== sourceAnchor.name
      );
      highlighter.unhighlight(...objects);
    }

    line.geometry.setFromPoints([
      sourceAnchor.position,
      Pointer.toScreenPosition(state.pointer, camera),
    ]);
  });

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (controller.state === "drag") return;
      highlighter.clear();
      const pointer = Pointer.fromMousePosition(e.clientX, e.clientY);

      const object = controller.findAnchorObjectByPoint(pointer.p);

      if (object) {
        setController(
          controller.setSourceAnchor(object).setState("drag").clone()
        );
        highlighter.highlight(object);
        dispatch(changeModeDisability({ isChangeDisabled: true }));
      } else {
        setController(controller.clear().clone());
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (controller.state === "idle") return;
      if (!controller.sourceAnchor) return;

      const pointer = Pointer.fromMousePosition(e.clientX, e.clientY);

      const object = controller.findAnchorObjectByPoint(pointer.p);
      if (object && object.name !== controller.sourceAnchor.name) {
        controller.setTargetAnchor(object);

        if (controller.connection) {
          dispatch(
            createConnection({ connection: controller.connection.unparse() })
          );
        }
      }

      // clear controller after mouse up
      highlighter.clear();
      setController(controller.clear().clone());
      dispatch(changeModeDisability({ isChangeDisabled: false }));
    };

    document.addEventListener("mousedown", onMouseDown, false);
    document.addEventListener("mouseup", onMouseUp, false);

    return () => {
      document.removeEventListener("mousedown", onMouseDown, false);
      document.removeEventListener("mouseup", onMouseUp, false);
    };
  }, [aspect, controller, dispatch]);

  if (!controller.sourceAnchor) {
    return null;
  }

  return (
    // TODO: add anchors
    <threeLine ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="orange" linewidth={5} />
    </threeLine>
  );
};

export default ConnectionCreator;
