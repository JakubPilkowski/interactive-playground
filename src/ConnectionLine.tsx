import { FC, useCallback, useRef } from "react";
import { Line } from "three";
import { useFrame, useThree } from "@react-three/fiber";

import { ConnectionState, IConnection } from "./features/connection/Connection";

interface IProps {
  connection: IConnection;
}

const ConnectionLine: FC<IProps> = ({ connection }) => {
  const scene = useThree((state) => state.scene);

  const ref = useRef<Line>(null);

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
    <threeLine ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color="orange" linewidth={5} />
    </threeLine>
  );
};

export default ConnectionLine;
