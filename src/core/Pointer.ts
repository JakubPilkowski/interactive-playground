import { Vector2, Vector3, Camera } from "three";

export default class Pointer {
  private _p: Vector2;

  constructor(x: number, y: number) {
    this._p = new Vector2(x, y);
  }

  get p(): Vector2 {
    return this._p;
  }

  static toScreenPosition(vNdc: Vector2, camera: Camera): Vector3 {
    const vPos = new Vector3(vNdc.x, vNdc.y, 0);
    // const vDir = new Vector3();
    // const vOutPos = new Vector3();

    // convert NDC coordinates to world coordinates
    vPos.unproject(camera);

    // Those calculations are required only when vPos.z is not equal 0
    // vDir.copy(vPos).sub(camera.position).normalize();
    // const flDistance = -camera.position.z / vDir.z;
    // vOutPos.copy(camera.position).add(vDir.multiplyScalar(flDistance));

    return vPos;
  }

  static fromMousePosition(clientX: number, clientY: number): Pointer {
    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = -(clientY / window.innerHeight) * 2 + 1;

    return new Pointer(x, y);
  }

  static fromDragPosition(
    offsetX: number,
    offsetY: number,
    aspect: number
  ): Pointer {
    const x = offsetX / aspect;
    const y = -(offsetY / aspect);

    return new Pointer(x, y);
  }
}
