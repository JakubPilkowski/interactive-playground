import { Vector3 } from "three";

export default function getBlockedAxis(origin, target, dir) {
  // const isLeftAxis = origin.min.x > target.min.x && origin.min.x < target.max.x;
  // const isRightAxis =
  //   origin.max.x > target.min.x && origin.max.x < target.max.x;
  // const isTopAxis = origin.min.y > target.min.y && origin.min.y < target.max.y;
  // const isBottomAxis =
  //   origin.max.y > target.min.y && origin.max.y < target.max.y;

  let vec = new Vector3();
  vec = origin.getSize(vec);

  if (dir === "top") {
    return {
      isTop: true,
      topMax: target.max.y + vec.y / 2,
    };
  }

  if (dir === "bottom") {
    return {
      isBottom: true,
      bottomMax: target.min.y - vec.y / 2,
    };
  }

  if (dir === "left") {
    return {
      isLeft: true,
      leftMax: target.max.x + vec.x / 2,
    };
  }

  if (dir === "right") {
    return {
      isRight: true,
      rightMax: target.min.x - vec.x / 2,
    };
  }
}
