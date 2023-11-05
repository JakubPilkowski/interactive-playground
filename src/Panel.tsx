import { FC, memo } from "react";
import { useAppSelector } from "./app/store";

import { INode } from "./features/nodes/nodeSlice";

import "./controller.css";

export type MoveToNodeEventHandler = (node: INode) => void;

export type AddNodeEventHandler = () => void;

interface IProps {
  onAdd: AddNodeEventHandler;
  onMove: MoveToNodeEventHandler;
}

const Panel: FC<IProps> = ({ onAdd, onMove }) => {
  const nodes = useAppSelector((state) => state.nodes);

  const handleMove = (node: INode) => () => {
    onMove(node);
  };

  return (
    <div className="panel">
      <button onClick={onAdd}>Add new box</button>
      <p>Move to</p>
      {nodes.map((node) => (
        <button key={node.id} onClick={handleMove(node)}>
          Move to {node.id}
        </button>
      ))}
    </div>
  );
};

export default memo(Panel);
