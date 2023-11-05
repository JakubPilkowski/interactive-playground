export default function getBlockedPosition(
  newPosition,
  oldPosition,
  blockedAxis
) {
  const {
    isTop,
    topMax,
    isBottom,
    bottomMax,
    isLeft,
    leftMax,
    isRight,
    rightMax,
  } = blockedAxis;
  const [newX, newY] = newPosition;
  const [oldX, oldY] = oldPosition;

  let blockedX = newX;
  let blockedY = newY;

  if (isTop && newY <= oldY) {
    blockedY = topMax;
    console.log("🚀 ~ file: getBlockedPosition.js:30 ~ blockedY:", blockedY);
  } else if (isBottom && newY >= oldY) {
    blockedY = bottomMax;
    console.log("🚀 ~ file: getBlockedPosition.js:33 ~ blockedY:", blockedY);
  } else if (isLeft && newX <= oldX) {
    blockedX = leftMax;
    console.log("🚀 ~ file: getBlockedPosition.js:36 ~ blockedX:", blockedX);
  } else if (isRight && newX >= oldX) {
    blockedX = rightMax;
    console.log("🚀 ~ file: getBlockedPosition.js:39 ~ blockedX:", blockedX);
  }

  return [blockedX, blockedY];
}
