import { FC, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring, a } from "@react-spring/three";
import { useDispatch } from "react-redux";
import { Html } from "@react-three/drei";
import { useGesture } from "@use-gesture/react";
import {
  Box3,
  Mesh,
  Object3D,
  PlaneGeometry,
  MeshBasicMaterial,
  Vector3,
} from "three";

import { useAppSelector } from "app/store";

import { INode, move } from "features/nodes/nodeSlice";

import "./box.css";

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
  /**
   * rgb color
   *
   * @defaultValue `#ffa500`
   */
  highlightColor?: string;
}

const Box: FC<IProps> = ({ node, highlightColor = "#ffa500" }) => {
  const meshRef = useRef<Mesh<PlaneGeometry, MeshBasicMaterial>>(null);
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
        const diffY = -newMouseDiffY / aspect;

        const newX = currX + diffX;
        const newY = currY + diffY;
        // const currX = lastOffset[0] / aspect;
        // const currY = -lastOffset[1] / aspect;
        const meshBoundary = new Box3().setFromObject(meshRef.current);

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
        // const oldVector = new Vector3(currX, currY, 0);
        // const newVector = new Vector3(newX, newY, 0);

        const maxX = Math.max(newX, currX);
        const maxY = Math.max(newY, currY);
        const minX = Math.min(newX, currX);
        const minY = Math.min(newY, currY);

        const addX = newX > currX ? 1 : -1;
        const addY = newY > currY ? 1 : -1;
        // const dir3 = newVector.sub(oldVector);
        // const dir3n = dir3.normalize();

        // const ray = new Ray(oldVector, dir3n);

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
        meshBoundary.set(newMin, newMax);

        let blockedX = newX;
        let blockedY = newY;

        if (boundaries) {
          boundaries.forEach((boundary) => {
            const res = meshBoundary.intersectsBox(boundary);
            // const rayRes = ray.intersectsBox(boundary);
            const lineRes = lineBox.intersectsBox(boundary);

            if (res || lineRes) {
              // TODO: add diffrent logic depending on res and lineRes
              // thats gonna be ugly
              const boundaryCenter = new Vector3();
              boundary.getCenter(boundaryCenter);

              const boundaryDir = new Vector3(
                boundaryCenter.x - (res ? newX : currX),
                boundaryCenter.y - (res ? newY : currY),
                0
              );

              // on right wall collision
              const rightMax = boundary.max.x + size.x / 2;
              // on left wall collision
              const leftMax = boundary.min.x - size.x / 2;
              // on top wall collision
              const topMax = boundary.max.y + size.y / 2;
              // on bottom wall collision
              const bottomMax = boundary.min.y - size.y / 2;

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
                const vertDirDot = boundaryDir.dot(verticalVec);

                let newVec: Vector3;

                if (horDirDot === vertDirDot) {
                  newVec = new Vector3(0, 0, 0);
                } else if (horDirDot < vertDirDot) {
                  newVec = horizontalVec.set(Math.abs(boundaryDir.x), 0, 0);
                } else {
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
                blockedY = getBlockedY();
              }
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

        api.set({ position: new Vector3(blockedX, blockedY, 0) });
      },
      onDragEnd: () => {
        objectsBoundaries = [];
        // TODO: controls typing
        controls.enabled = true;
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

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const isHiglighted: boolean =
      meshRef.current.userData.isHiglighted || false;

    const isTriggered: boolean = meshRef.current.userData.isTriggered || false;

    if (isHiglighted && !isTriggered) {
      mesh.userData = {
        ...mesh.userData,
        isTriggered: true,
        originalColor: "#ff69b4",
      };
      mesh.material.color.set(highlightColor);
    } else if (!isHiglighted && isTriggered) {
      mesh.userData = {
        ...mesh.userData,
        isTriggered: false,
      };
      mesh.material.color.set(mesh.userData.originalColor);
    }
  });

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
