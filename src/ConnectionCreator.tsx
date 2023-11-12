import { FC, useEffect, useState } from "react";
import { Vector2, Vector3 } from "three";
import { useThree } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import { useSpring, a } from "@react-spring/three";
import { Line } from "@react-three/drei";

import { useAppDispatch } from "./app/store";

import { createConnection } from "./features/connection/connectionsSlice";
import { changeModeDisability } from "./features/playground/playgroundSlice";

// import Connection, { ConnectionState } from "./features/connection/Connection";
import ConnectionController from "./features/connection/ConnectionController";

interface IProps {}

const AnimatedLine = a(Line);

const ConnectionCreator: FC<IProps> = () => {
  const { size, viewport, scene, camera } = useThree();

  const [controller, setController] = useState(
    new ConnectionController(scene, camera, null)
  );

  const dispatch = useAppDispatch();

  // const ref = useRef(null);

  const aspect = size.width / viewport.width;

  console.log(controller.sourceAnchor?.position);

  const [spring, api] = useSpring(() => ({
    points: [new Vector3(4, 2, 0), new Vector3(5, 0, 0)],
    // controller.sourceAnchor
    //   ? [new Vector3(4, 2, 0), new Vector3(5, 0, 0)]
    //   : [new Vector3(), new Vector3()],
    config: { precision: 0.0001, friction: 26 },
  }));

  const bind = useGesture(
    {
      onDragStart: () => {
        console.log("drag start");
      },
      onDrag: ({ offset: [x, y] }) => {
        const newX = x / aspect;
        const newY = -y / aspect;

        const pointer = new Vector2(newX, newY);
        console.log("🚀 ~ file: ConnectionCreator.tsx:44 ~ pointer:", pointer);

        const object = controller.findAnchorObjectByPoint(pointer);
        if (object) {
          controller.highlightAnchor(object);
        } else {
          // TODO: add object unhighlight
        }

        // if (controller.sourceAnchor) {
        api.set({
          points: [
            // controller.sourceAnchor.position,
            new Vector3(4, 2, 0),
            new Vector3(newX, newY, 0),
          ],
        });
        // }

        // console.log("🚀 ~ file: Box.jsx:82 ~ Box ~ newX:", newX);
        // console.log("🚀 ~ file: Box.jsx:84 ~ Box ~ newY:", newY);
      },
      onDragEnd: ({ offset: [x, y] }) => {
        const newX = x / aspect;
        const newY = -y / aspect;

        const pointer = new Vector2(newX, newY);

        const object = controller.findAnchorObjectByPoint(pointer);
        if (object && object.name !== controller.sourceAnchor?.name) {
          controller.setTargetAnchor(object);

          if (controller.connection) {
            dispatch(createConnection({ connection: controller.connection }));
          }
        }

        setController(controller.clear().clone());
        dispatch(changeModeDisability({ isChangeDisabled: false }));
      },
    },
    {
      drag: {
        from: () => {
          console.log("from");
          const sourceAnchor = controller.sourceAnchor;
          if (!sourceAnchor) return [0, 0];
          const startPosition = sourceAnchor.position;

          const startX = startPosition.x * aspect;
          const startY = -startPosition.y * aspect;
          return [startX, startY];
          // currX = node.x;
          // currY = node.y;
          // currMouseX = startX;
          // currMouseY = startY;
          // return [startX, startY];
        },
      },
    }
  );

  // useEffect(() => {
  //   if (controller.state === "drag") return;

  //   const onMove = (e: MouseEvent) => {
  //     // TODO: add Pointer class
  //     if (controller.state === "drag") return;
  //     const pointer = new Vector2();
  //     pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  //     pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  //     const object = controller.findAnchorObjectByPoint(pointer);
  //     if (object) {
  //       controller.highlightAnchor(object);
  //     } else {
  //       // TODO: add object unhiglight
  //     }
  //   };

  //   const onMouseDown = (e: MouseEvent) => {
  //     if (controller.state === "drag") return;
  //     const pointer = new Vector2();
  //     pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  //     pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  //     const object = controller.findAnchorObjectByPoint(pointer);

  //     if (object) {
  //       setController(
  //         controller.setSourceAnchor(object).setState("drag").clone()
  //       );
  //       dispatch(changeModeDisability({ isChangeDisabled: true }));
  //     } else {
  //       setController(controller.clear().clone());
  //     }
  //   };

  //   document.addEventListener("mousemove", onMove, false);
  //   document.addEventListener("mousedown", onMouseDown, false);

  //   return () => {
  //     document.removeEventListener("mousemove", onMove, false);
  //     document.removeEventListener("mousedown", onMouseDown, false);
  //   };
  // }, [controller, dispatch]);

  // if (!controller.connection || !controller.sourceAnchor) {
  //   return null;
  // }

  console.log("line exists");
  console.log(bind());

  return (
    // TODO: add anchors
    <AnimatedLine
      // ref={ref}
      // points={[new Vector3(2, 0, 0), new Vector3(4, 2, 0)]}
      {...spring}
      {...bind()}
      color="green"
      lineWidth={1}
      dashed={false}
      // vertexColors={[[0, 0, 0], ...]}
      // {...lineProps}
      // {...materialProps}
    />
  );
};

export default ConnectionCreator;
