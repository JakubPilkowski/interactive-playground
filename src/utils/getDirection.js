export default function getDirection(newPos, oldPos) {
  const horDir = newPos[0] > oldPos[0] ? "right" : "left";
  const verDir = newPos[1] > oldPos[1] ? "top" : "bottom";

  const horDiff = newPos[0] - oldPos[0];
  const verDiff = newPos[1] - oldPos[1];

  return horDiff > verDiff ? horDir : verDir;
}
