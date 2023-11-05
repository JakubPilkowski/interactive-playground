import { memo, FC } from "react";

import { useAppSelector } from "./app/store";

import Box from "./Box";
import ConnectionLine from "./ConnectionLine";

import "./controller.css";

const Controller: FC = () => {
  const nodes = useAppSelector((state) => state.nodes);
  const connections = useAppSelector((state) => state.connections);
  // const scene = useThree((state) => state.scene);

  // useEffect(() => {
  //   scene.traverse((child) => {
  //     console.log(child.name);
  //   });
  // }, [nodes, scene]);

  return (
    <>
      <group name="nodes_group">
        {nodes.map((node) => (
          <Box
            key={node.id}
            node={node}
            // position={[node.x, node.y, 0]}
          />
        ))}
      </group>
      {connections.map((connection) => (
        <ConnectionLine key={connection.id} connection={connection} />
      ))}
    </>
  );
};

export default memo(Controller);
