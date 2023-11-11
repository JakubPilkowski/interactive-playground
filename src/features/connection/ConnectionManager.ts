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

export default class ConnectionManager {
  private scene: Scene;
  private camera: Camera;
  private raycaster: Raycaster;
  private sourceAnchor: Mesh<BufferGeometry, MeshBasicMaterial> | null;
  private targetAnchor: Mesh<BufferGeometry, MeshBasicMaterial> | null;
  private connection: Connection | null;

  constructor(scene: Scene, camera: Camera, connection: Connection | null) {
    this.camera = camera;
    this.raycaster = new Raycaster();
    this.connection = connection;
    this.scene = scene;
    this.sourceAnchor = null;
    this.targetAnchor = null;
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

  // TODO add pinSource
  setSourceAnchor(anchor: Object3D<Object3DEventMap>): this {
    this.unsetSourceAnchor();
    this.sourceAnchor = anchor as Mesh<BufferGeometry, MeshBasicMaterial>;
    this.sourceAnchor.userData = {
      originalColor: this.sourceAnchor.material.color,
    };
    this.sourceAnchor.material.color.set("#ffa500");
    return this;
  }

  // TODO add unpinSource
  unsetSourceAnchor(): this {
    if (!this.sourceAnchor) return this;
    const baseColor = this.sourceAnchor.userData.originalColor;
    this.sourceAnchor.material.color.set(baseColor);
    this.sourceAnchor.userData = {};
    this.sourceAnchor = null;
    return this;
  }

  // TODO: add pinTarget
  setTargetAnchor(anchor: Object3D<Object3DEventMap>): this {
    this.unsetTargetAnchor();
    this.targetAnchor = anchor as Mesh<BufferGeometry, MeshBasicMaterial>;
    this.targetAnchor.userData = {
      originalColor: this.targetAnchor.material.color,
    };
    this.targetAnchor.material.color.set("#ffa500");
    return this;
  }

  // TODO: add unpinTarget
  unsetTargetAnchor(): this {
    if (!this.targetAnchor) return this;
    const baseColor = this.targetAnchor.userData.originalColor;
    this.targetAnchor.material.color.set(baseColor);
    this.targetAnchor.userData = {};
    this.targetAnchor = null;
    return this;
  }

  clear(): this {
    this.connection = null;
    this.unsetSourceAnchor();
    this.unsetTargetAnchor();
    return this;
  }

  clone(): ConnectionManager {
    const { sourceAnchor, targetAnchor, camera, scene, connection } = this;

    const clone = new ConnectionManager(
      scene,
      camera,
      connection?.clone() || null
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
