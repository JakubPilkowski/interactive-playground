import { FC, useCallback, useRef } from "react";
import { BufferGeometry, Line } from "three";
import { useFrame, useThree } from "@react-three/fiber";

import Connection, { ConnectionState } from "./features/connection/Connection";

interface IProps {
  connection: Connection;
}

const ConnectionLine: FC<IProps> = ({ connection }) => {
  const scene = useThree((state) => state.scene);

  const ref = useRef<Line<BufferGeometry>>(null);

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
  }, [connection, scene]);

  useFrame(() => {
    updatePosition();
  });

  return (
    // TODO: add anchors
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color="orange" linewidth={5} />
    </line>
  );
};

export default ConnectionLine;
