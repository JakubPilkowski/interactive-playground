import {
  BufferGeometry,
  Camera,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Object3DEventMap,
  Raycaster,
  Scene,
  Vector2,
} from "three";
import Connection from "./Connection";

export default class ConnectionController {
  private scene: Scene;
  private camera: Camera;
  private raycaster: Raycaster;
  private _sourceAnchor: Mesh<BufferGeometry, MeshBasicMaterial> | null;
  private _targetAnchor: Mesh<BufferGeometry, MeshBasicMaterial> | null;
  private _connection: Connection | null;
  private _state: "drag" | "idle";

  constructor(scene: Scene, camera: Camera, connection: Connection | null) {
    this.camera = camera;
    this.raycaster = new Raycaster();
    this._connection = connection;
    this.scene = scene;
    this._sourceAnchor = null;
    this._targetAnchor = null;
    this._state = "idle";
  }

  get connection(): Connection | null {
    return this._connection;
  }

  get state(): "drag" | "idle" {
    return this._state;
  }

  get sourceAnchor(): Mesh<BufferGeometry, MeshBasicMaterial> | null {
    return this._sourceAnchor;
  }

  get targetAnchor(): Mesh<BufferGeometry, MeshBasicMaterial> | null {
    return this._targetAnchor;
  }

  setState(state: "drag" | "idle"): this {
    this._state = state;
    return this;
  }

  private getNodes(): Object3D<Object3DEventMap>[] {
    const group = this.scene.getObjectByName("nodes_group");
    const nodes: Object3D<Object3DEventMap>[] = [];

    if (!group) {
      return nodes;
    }

    group?.traverse((child) => {
      if (child.type === "group") {
        return;
      }
      nodes.push(child);
    });

    return nodes;
  }

  // TODO: add findAnchorType(point, anchorId)

  findAnchorObjectByPoint(point: Vector2): Object3D<Object3DEventMap> | null {
    const nodes = this.getNodes();
    if (nodes.length === 0) {
      return null;
    }

    this.raycaster.setFromCamera(point, this.camera);

    const objects = this.raycaster.intersectObjects(nodes, false);

    if (objects.length === 0) {
      return null;
    }

    if (objects.length > 1) {
      throw new Error(
        "Could not find connection object. There are more than one possible connection objects"
      );
    }

    return objects[0].object;
  }

  highlightAnchor(anchor: Object3D<Object3DEventMap>): this {
    const mesh = anchor as Mesh<BufferGeometry, MeshBasicMaterial>;
    mesh.userData = {
      originalColor: mesh.material.color,
    };
    mesh.material.color.set("#ffa500");
    return this;
  }

  setSourceAnchor(anchor: Object3D<Object3DEventMap>): this {
    this.unsetSourceAnchor();
    if (this._connection) {
      this._connection.pinSource(anchor.name);
    } else {
      this._connection = new Connection({ source: anchor.name, target: null });
    }
    this._sourceAnchor = anchor as Mesh<BufferGeometry, MeshBasicMaterial>;
    // this._sourceAnchor.userData = {
    //   originalColor: this._sourceAnchor.material.color,
    // };
    // this._sourceAnchor.material.color.set("#ffa500");
    return this;
  }

  unsetSourceAnchor(): this {
    if (!this._sourceAnchor) return this;
    if (this._connection) {
      this._connection.unpinSource();
    }
    // const baseColor = this._sourceAnchor.userData.originalColor;
    // this._sourceAnchor.material.color.set(baseColor);
    // this._sourceAnchor.userData = {};
    this._sourceAnchor = null;
    return this;
  }

  // TODO: add pinTarget
  setTargetAnchor(anchor: Object3D<Object3DEventMap>): this {
    this.unsetTargetAnchor();
    if (this._connection) {
      this._connection.pinTarget(anchor.name);
    } else {
      this._connection = new Connection({ source: null, target: anchor.name });
    }
    this._targetAnchor = anchor as Mesh<BufferGeometry, MeshBasicMaterial>;
    // this._targetAnchor.userData = {
    //   originalColor: this._targetAnchor.material.color,
    // };
    // this._targetAnchor.material.color.set("#ffa500");
    return this;
  }

  // TODO: add unpinTarget
  unsetTargetAnchor(): this {
    if (!this._targetAnchor) return this;
    if (this._connection) {
      this._connection.unpinTarget();
    }
    // const baseColor = this._targetAnchor.userData.originalColor;
    // this._targetAnchor.material.color.set(baseColor);
    // this._targetAnchor.userData = {};
    this._targetAnchor = null;
    return this;
  }

  clear(): this {
    this._connection = null;
    this.unsetSourceAnchor();
    this.unsetTargetAnchor();
    this.setState("idle");
    return this;
  }

  clone(): ConnectionController {
    const { sourceAnchor, targetAnchor, camera, scene, _connection } = this;

    const clone = new ConnectionController(
      scene,
      camera,
      _connection?.clone() || null
    );

    if (sourceAnchor) {
      clone.setSourceAnchor(sourceAnchor);
    }
    if (targetAnchor) {
      clone.setTargetAnchor(targetAnchor);
    }

    return clone;
  }
}
