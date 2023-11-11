import { FC, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useSpring, a } from "@react-spring/three";
import { useDispatch } from "react-redux";
import { Html } from "@react-three/drei";
import { useGesture } from "@use-gesture/react";

import {
  Box3,
  BufferGeometry,
  Material,
  Mesh,
  NormalBufferAttributes,
  Object3D,
  Object3DEventMap,
  Vector3,
} from "three";

import { INode, move } from "./features/nodes/nodeSlice";

import "./box.css";
import { useAppSelector } from "./app/store";

function getBoundaries(group: Object3D, origin: Mesh): Box3[] {
  const objectsBoundaries: Box3[] = [];

  group.traverse((child) => {
    if (child.type === "Group") {
      return;
    }
    if (child.name === origin.name) return;
    const objectBoundary = new Box3().setFromObject(child);
    objectsBoundaries.push(objectBoundary);
  });

  return objectsBoundaries;
}

interface IProps {
  node: INode;
  // position: [number, number, number];
}

const Box: FC<IProps> = ({ node }) => {
  const meshRef =
    useRef<
      Mesh<
        BufferGeometry<NormalBufferAttributes>,
        Material | Material[],
        Object3DEventMap
      >
    >(null);
  const htmlRef = useRef<HTMLDivElement>(null);

  const { size, viewport } = useThree();
  const controls = useThree((state) => state.controls);
  const scene = useThree((state) => state.scene);

  const currentMode = useAppSelector((state) => state.playground.currentMode);

  const dispatch = useDispatch();

  const aspect = size.width / viewport.width;

  const [spring, api] = useSpring(() => ({
    position: new Vector3(node.x, node.y, 0),
    config: { precision: 0.0001, friction: 26 },
  }));

  let objectsBoundaries: Box3[] = [];
  let currX = 0;
  let currY = 0;
  let currMouseX = 0;
  let currMouseY = 0;

  const bind = useGesture(
    {
      onDragStart: () => {
        // TODO: controls type
        controls.enabled = false;
        const group = scene.getObjectByName("nodes_group");

        if (!group || !meshRef.current) {
          return;
        }
        objectsBoundaries = getBoundaries(group, meshRef.current);
      },
      onDrag: ({ offset: [x, y] }) => {
        if (!meshRef.current) return;
        const boundaries = objectsBoundaries;
        const newMouseDiffX = x - currMouseX;
        const newMouseDiffY = y - currMouseY;
        const diffX = newMouseDiffX / aspect;
        // console.log("🚀 ~ file: Box.jsx:76 ~ Box ~ x:", x);
        // console.log("🚀 ~ file: Box.jsx:76 ~ Box ~ currMouseX:", currMouseX);
        const diffY = -newMouseDiffY / aspect;
        // console.log("🚀 ~ file: Box.jsx:79 ~ Box ~ y:", y);
        // console.log("🚀 ~ file: Box.jsx:78 ~ Box ~ currMouseY:", currMouseY);

        const newX = currX + diffX;
        // console.log("🚀 ~ file: Box.jsx:83 ~ Box ~ currX:", currX);
        // console.log("🚀 ~ file: Box.jsx:79 ~ Box ~ diffX:", diffX);
        // console.log("🚀 ~ file: Box.jsx:79 ~ Box ~ newX:", newX);
        const newY = currY + diffY;
        // console.log("🚀 ~ file: Box.jsx:87 ~ Box ~ currY:", currY);
        // console.log("🚀 ~ file: Box.jsx:82 ~ Box ~ diffY:", diffY);
        // console.log("🚀 ~ file: Box.jsx:81 ~ Box ~ tmpY:/", tmpY);

        // const newX = x / aspect;
        // console.log("🚀 ~ file: Box.jsx:82 ~ Box ~ newX:", newX);
        // const newY = -y / aspect;
        // console.log("🚀 ~ file: Box.jsx:84 ~ Box ~ newY:", newY);

        // const currX = lastOffset[0] / aspect;
        // const currY = -lastOffset[1] / aspect;
        const meshBoundary = new Box3().setFromObject(meshRef.current);

        // console.log("currX", currX);
        // console.log("currY", currY);
        // console.log("newX", newX);
        // console.log("newY", newY);

        const size = new Vector3();
        meshBoundary.getSize(size);

        // let center = new Vector3();
        // meshBoundary.getCenter(center);

        const newMin = new Vector3(
          newX - size.x / 2,
          newY - size.y / 2,
          meshBoundary.min.z
        );

        const newMax = new Vector3(
          newX + size.x / 2,
          newY + size.y / 2,
          meshBoundary.max.z
        );

        // const dirVec = new Vector2(newX - currX, newY - currY);
        // console.log("🚀 ~ file: Box.jsx:126 ~ Box ~ dirVec:", dirVec);

        // const oldVector = new Vector3(currX, currY, 0);
        // console.log("🚀 ~ file: Box.jsx:98 ~ Box ~ oldVector:", oldVector);
        // const newVector = new Vector3(newX, newY, 0);
        // console.log("🚀 ~ file: Box.jsx:100 ~ Box ~ newVector:", newVector);

        // console.log(dirVec);

        const maxX = Math.max(newX, currX);
        const maxY = Math.max(newY, currY);
        const minX = Math.min(newX, currX);
        const minY = Math.min(newY, currY);

        const addX = newX > currX ? 1 : -1;
        const addY = newY > currY ? 1 : -1;
        // const dir3 = newVector.sub(oldVector);
        // console.log("🚀 ~ file: Box.jsx:99 ~ Box ~ dir3:", dir3);
        // const dir3n = dir3.normalize();

        // const ray = new Ray(oldVector, dir3n);

        //   "🚀 ~ file: Box.jsx:107 ~ Box ~ lineGeometry:",
        //   lineGeometry
        // );
        const lineBox = new Box3(
          new Vector3(
            addX > 0 ? minX + 2 : minX - size.x / 2,
            addY > 0 ? minY : minY - size.y / 2,
            0
          ),
          new Vector3(
            addX > 0 ? maxX + 2 + size.x / 2 : maxX,
            addY > 0 ? maxY + size.y / 2 : maxY,
            0
          )
        );
        // const box3Helper = new Box3Helper(lineBox, 0x00ff00);
        // box3Helper.material.linewidth = 2;
        // scene.add(box3Helper);

        // console.log("🚀 ~ file: Box.jsx:107 ~ Box ~ lineBox:", lineBox);
        // console.log(lineBox.getSize(new Vector3()));
        // console.log(lineBox.getCenter(new Vector3()));
        // console.log(
        //   "🚀 ~ file: Box.jsx:118 ~ boundaries.forEach ~ meshBoundary:",
        //   meshBoundary
        // );

        meshBoundary.set(newMin, newMax);

        let blockedX = newX;
        let blockedY = newY;

        if (boundaries) {
          boundaries.forEach((boundary) => {
            const res = meshBoundary.intersectsBox(boundary);
            // const rayRes = ray.intersectsBox(boundary);
            const lineRes = lineBox.intersectsBox(boundary);
            // console.log(
            //   "🚀 ~ file: Box.jsx:148 ~ boundaries.forEach ~ boundary:",
            //   boundary
            // );
            // console.log(
            //   "🚀 ~ file: Box.jsx:115 ~ boundaries.forEach ~ rayRes:",
            //   rayRes
            // );

            if (res || lineRes) {
              // TODO: add diffrent logic depending on res and lineRes
              // thats gonna be ugly
              console.log(
                "🚀 ~ file: Box.jsx:212 ~ boundaries.forEach ~ res:",
                res
              );
              console.log(
                "🚀 ~ file: Box.jsx:216 ~ boundaries.forEach ~ lineRes:",
                lineRes
              );
              console.log("🚀 ~ file: Box.jsx:219 ~ Box ~ currX:", currX);
              console.log("🚀 ~ file: Box.jsx:220 ~ Box ~ newX:", newX);

              const boundaryCenter = new Vector3();
              boundary.getCenter(boundaryCenter);

              console.log(
                "🚀 ~ file: Box.jsx:226 ~ boundaries.forEach ~ boundary:",
                boundary
              );
              // console.log(
              //   "🚀 ~ file: Box.jsx:215 ~ boundaries.forEach ~ newX:",
              //   newX
              // );
              // console.log(
              //   "🚀 `~ file: Box.jsx:218 ~ boundaries.forEach ~ newY:",
              //   newY
              // );

              const boundaryDir = new Vector3(
                boundaryCenter.x - (res ? newX : currX),
                boundaryCenter.y - (res ? newY : currY),
                0
              );
              console.log(
                "🚀 ~ file: Box.jsx:214 ~ boundaries.forEach ~ boundaryDir:",
                boundaryDir
              );

              // on right wall collision
              const rightMax = boundary.max.x + size.x / 2;
              // on left wall collision
              const leftMax = boundary.min.x - size.x / 2;
              // on top wall collision
              const topMax = boundary.max.y + size.y / 2;
              // on bottom wall collision
              const bottomMax = boundary.min.y - size.y / 2;

              // console.log(
              //   "🚀 ~ file: Box.jsx:130 ~ boundaries.forEach ~ dirVec:",
              //   dirVec
              // );

              if (boundaryDir.x === 0 || boundaryDir.y === 0) {
                blockedX =
                  boundaryDir.x === 0
                    ? currX
                    : boundaryDir.x > 0
                    ? leftMax
                    : rightMax;
                blockedY =
                  boundaryDir.y === 0
                    ? currY
                    : boundaryDir.y > 0
                    ? bottomMax
                    : topMax;
              } else {
                // TODO: check if vec2 to vec3 changed something
                const horizontalVec = new Vector3(boundaryDir.x, 0, 0);
                const verticalVec = new Vector3(0, boundaryDir.y, 0);
                const horDirDot = boundaryDir.dot(horizontalVec);
                // console.log(
                //   "🚀 ~ file: Box.jsx:161 ~ boundaries.forEach ~ horDirDot:",
                //   horDirDot
                // );
                const vertDirDot = boundaryDir.dot(verticalVec);
                // console.log(
                //   "🚀 ~ file: Box.jsx:163 ~ boundaries.forEach ~ vertDirDot:",
                //   vertDirDot
                // );

                let newVec: Vector3;

                if (horDirDot === vertDirDot) {
                  // console.log(
                  //   "🚀 ~ file: Box.jsx:151 ~ boundaries.forEach ~ horDirDot === vertDirDot:",
                  //   horDirDot === vertDirDot
                  // );
                  newVec = new Vector3(0, 0, 0);
                } else if (horDirDot < vertDirDot) {
                  // console.log(
                  //   "🚀 ~ file: Box.jsx:153 ~ boundaries.forEach ~ horDirDot < vertDirDot:",
                  //   horDirDot < vertDirDot
                  // )
                  newVec = horizontalVec.set(Math.abs(boundaryDir.x), 0, 0);
                } else {
                  // console.log(
                  //   "🚀 ~ file: Box.jsx:156 ~ boundaries.forEach ~ else:",
                  //   "else"
                  // );
                  newVec = verticalVec.set(0, Math.abs(boundaryDir.y), 0);
                }

                const getBlockedX = () => {
                  if (newVec.x === 0) {
                    if (boundaryDir.x > 0) {
                      return leftMax;
                    } else if (boundaryDir.x < 0) {
                      return rightMax;
                    } else {
                      return currX;
                    }
                  } else {
                    return res ? newX : currY;
                  }
                };

                const getBlockedY = () => {
                  if (newVec.y === 0) {
                    if (boundaryDir.y > 0) {
                      return bottomMax;
                    } else if (boundaryDir.y < 0) {
                      return topMax;
                    } else {
                      return currY;
                    }
                  } else {
                    return res ? newY : currY;
                  }
                };

                blockedX = getBlockedX();
                console.log(
                  "🚀 ~ file: Box.tsx:341 ~ boundaries.forEach ~ blockedX:",
                  blockedX
                );
                blockedY = getBlockedY();
                // console.log(
                //   "🚀 ~ file: Box.jsx:182 ~ boundaries.forEach ~ blockedX:",
                //   blockedX
                // );
                // console.log(
                //   "🚀 ~ file: Box.jsx:184 ~ boundaries.forEach ~ blockedY:",
                //   blockedY
                // );
              }

              // blockedAxis = {
              //   ...blockedAxis,
              //   ...getBlockedAxis(meshBoundary, boundary, dir),
              // };
            }
          });
        }

        // if (boundariesVec2.length > 0) {
        //   boundariesVec2.forEach((boundaryVec2) => {});
        // }

        // const [blockedX, blockedY] = getBlockedPosition(
        //   [newX, newY],
        //   [currX, currY],
        //   blockedAxis
        // );
        currX = blockedX;
        currY = blockedY;

        currMouseX += newMouseDiffX;
        currMouseY += newMouseDiffY;
        // console.log("blockedX", blockedX);
        // console.log("blockedY", blockedY);

        api.set({ position: new Vector3(blockedX, blockedY, 0) });
      },
      onDragEnd: () => {
        objectsBoundaries = [];
        // TODO: controls typing
        controls.enabled = true;
        // const newX = x / aspect;
        // const newY = -y / aspect;
        dispatch(move({ id: node.id, position: { x: currX, y: currY } }));
      },
    },
    {
      drag: {
        from: () => {
          const startX = node.x * aspect;
          const startY = -node.y * aspect;
          currX = node.x;
          currY = node.y;
          currMouseX = startX;
          currMouseY = startY;
          return [startX, startY];
        },
      },
      enabled:
        typeof currentMode.movement.nodes === "boolean"
          ? currentMode.movement.nodes
          : true,
    }
  );

  return (
    <a.mesh
      // position={position}
      {...spring}
      {...bind()}
      ref={meshRef}
      scale={1}
      name={String(node.id)}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color={"hotpink"} />

      {/* Html tag must be inside mesh component */}
      <Html
        name={String(node.id)}
        ref={htmlRef}
        wrapperClass="box"
        center
        // occlude
        // className="box"
        // center
        distanceFactor={10}
      >
        <p>X: {meshRef.current?.position.x.toFixed(2)}</p>
        <p>Y: {meshRef.current?.position.y.toFixed(2)}</p>
        {/* <input /> */}
      </Html>
    </a.mesh>
  );
};

export default Box;
