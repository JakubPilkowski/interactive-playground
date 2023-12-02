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
  /**
   * Whether we are looking for 'source' or 'target'
   *
   * @defaultValue `target`
   */
  private _destination: ConnectionDestination;

  constructor(scene: Scene, camera: Camera, connection: Connection | null) {
    this.camera = camera;
    this.raycaster = new Raycaster();
    this._connection = connection;
    this.scene = scene;
    this._sourceAnchor = this.findAnchorByConnection(connection, "source");
    this._targetAnchor = this.findAnchorByConnection(connection, "target");
    this._state = "idle";
    this._destination = "target";
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

  get destination(): ConnectionDestination {
    return this._destination;
  }

  setDestination(destination: ConnectionDestination): this {
    this._destination = destination;
    return this;
  }

  setState(state: "drag" | "idle"): this {
    this._state = state;
    return this;
  }

  setConnection(connection: Connection | null): this {
    this._connection = connection;

    if (this._connection) {
      this._sourceAnchor = this.findAnchorByConnection(
        this._connection,
        "source"
      );
      this._targetAnchor = this.findAnchorByConnection(
        this._connection,
        "target"
      );
    } else {
      this._sourceAnchor = null;
      this._targetAnchor = null;
    }

    return this;
  }

  private findAnchorByConnection(
    connection: Connection | null,
    destination: ConnectionDestination
  ): Mesh<BufferGeometry, MeshBasicMaterial> | null {
    if (!connection) return null;
    if (!connection[destination]) return null;

    return this.scene.getObjectByName(
      connection[destination] as string
    ) as Mesh<BufferGeometry, MeshBasicMaterial> | null;
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

  /**
   * @param point normalized pointer position
   * @returns find anchor object using raycaster
   */
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

  setSourceAnchor(anchor: Object3D<Object3DEventMap>): this {
    this.unsetSourceAnchor();
    if (this._connection) {
      this._connection.pinSource(anchor.name);
    } else {
      this._connection = new Connection({ source: anchor.name, target: null });
    }
    this._sourceAnchor = anchor as Mesh<BufferGeometry, MeshBasicMaterial>;
    return this;
  }

  unsetSourceAnchor(): this {
    if (!this._sourceAnchor) return this;
    if (this._connection) {
      this._connection.unpinSource();
    }
    this._sourceAnchor = null;
    return this;
  }

  setTargetAnchor(anchor: Object3D<Object3DEventMap>): this {
    this.unsetTargetAnchor();
    if (this._connection) {
      this._connection.pinTarget(anchor.name);
    } else {
      this._connection = new Connection({ source: null, target: anchor.name });
    }
    this._targetAnchor = anchor as Mesh<BufferGeometry, MeshBasicMaterial>;
    return this;
  }

  unsetTargetAnchor(): this {
    if (!this._targetAnchor) return this;
    if (this._connection) {
      this._connection.unpinTarget();
    }
    this._targetAnchor = null;
    return this;
  }

  setAnchorByDestination(anchor: Object3D<Object3DEventMap>): this {
    if (this._destination === "source") {
      return this.setSourceAnchor(anchor);
    }
    return this.setTargetAnchor(anchor);
  }

  unsetAnchorByDestination(): this {
    if (this._destination === "source") {
      return this.unsetSourceAnchor();
    }
    return this.unsetTargetAnchor();
  }

  clear(): this {
    this.setConnection(null);
    this.setState("idle");
    this.setDestination("target");
    return this;
  }

  clone(): ConnectionController {
    const { camera, _state, scene, _connection, _destination } = this;

    const clone = new ConnectionController(
      scene,
      camera,
      _connection?.clone() || null
    );

    // if (sourceAnchor) {
    //   clone.setSourceAnchor(sourceAnchor);
    // }
    // if (targetAnchor) {
    //   clone.setTargetAnchor(targetAnchor);
    // }

    clone.setState(_state);
    clone.setDestination(_destination);

    return clone;
  }
}

export type ConnectionDestination = "source" | "target";
