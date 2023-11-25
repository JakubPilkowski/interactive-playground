import { FC, memo } from "react";
import clsx from "clsx";

import { useAppSelector } from "../../app/store";

import { INode } from "../../features/nodes/nodeSlice";
import { IMode } from "../../features/playground/Playground";

import "./panel.css";

const Panel: FC<IProps> = ({ onAdd, onMove, onModeSet }) => {
  const nodes = useAppSelector((state) => state.nodes);
  const playground = useAppSelector((state) => state.playground);

  const handleMove = (node: INode) => () => {
    onMove(node);
  };

  const handleModeSet = (mode: IMode) => () => {
    onModeSet(mode);
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
      <hr />
      <section>
        {playground.modes.map((mode) => (
          <button
            key={mode.name}
            onClick={handleModeSet(mode)}
            className={clsx("mode-button", {
              active: mode.name === playground.currentMode.name,
            })}
          >
            {mode.name}
          </button>
        ))}
      </section>
    </div>
  );
};

export default memo(Panel);

interface IProps {
  onAdd: AddNodeEventHandler;
  onMove: MoveToNodeEventHandler;
  onModeSet: SetModeEventHandler;
}

export type MoveToNodeEventHandler = (node: INode) => void;

export type AddNodeEventHandler = () => void;

export type SetModeEventHandler = (mode: IMode) => void;
