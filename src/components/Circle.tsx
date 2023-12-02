import { useRef, forwardRef, useImperativeHandle } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";

import { Mesh, CircleGeometry, MeshBasicMaterial, Vector3 } from "three";

// TODO: pulse animation
const Circle = forwardRef<CircleRef, IProps>(
  (
    {
      color = "#faa500",
      highlightColor = "#90ee90",
      position,
      onPointerDown,
      onPointerUp,
    },
    ref
  ) => {
    const circleRef = useRef<CircleRef>(null);

    useImperativeHandle(ref, () => circleRef.current as CircleRef);

    useFrame(() => {
      const mesh = circleRef.current;
      if (!mesh) return;
      const isHiglighted: boolean = mesh.userData.isHiglighted || false;
      const isTriggered: boolean = mesh.userData.isTriggered || false;
      // TODO: add highlight type

      if (isHiglighted && !isTriggered) {
        mesh.userData = {
          ...mesh.userData,
          isTriggered: true,
          originalColor: color,
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
      <mesh
        ref={circleRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        position={position}
      >
        <circleGeometry args={[0.1, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
    );
  }
);

interface IProps {
  color?: string;
  highlightColor?: string;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (event: ThreeEvent<PointerEvent>) => void;
  position?: Vector3;
}

export type CircleRef = Mesh<CircleGeometry, MeshBasicMaterial>;

export default Circle;
