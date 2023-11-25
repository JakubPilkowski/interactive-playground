import {
  Object3D,
  Mesh,
  BufferGeometry,
  MeshBasicMaterial,
  Object3DEventMap,
} from "three";

// TODO: this should have dynamic object type
export default class Highlighter {
  private _highlightObjects: Map<string, Object3D<Object3DEventMap>>;

  constructor(highlightObjects?: Map<string, Object3D<Object3DEventMap>>) {
    this._highlightObjects = highlightObjects || new Map();
  }

  get highlightObjects(): Object3D<Object3DEventMap>[] {
    return Array.from(this._highlightObjects.values());
  }

  highlight(...objects: Object3D<Object3DEventMap>[]): this {
    objects.forEach((obj) => {
      const mesh = obj as Mesh<BufferGeometry, MeshBasicMaterial>;
      mesh.userData = {
        ...mesh.userData,
        isHiglighted: true,
      };
      this._highlightObjects.set(mesh.name, mesh);
    });

    return this;
  }

  unhighlight(...objects: Object3D<Object3DEventMap>[]): this {
    objects.forEach((obj) => {
      const mesh = obj as Mesh<BufferGeometry, MeshBasicMaterial>;
      mesh.userData = {
        ...mesh.userData,
        isHiglighted: false,
      };
      this._highlightObjects.delete(mesh.name);
    });

    return this;
  }

  clear(): this {
    Array.from(this._highlightObjects.values()).forEach((obj) => {
      const mesh = obj as Mesh<BufferGeometry, MeshBasicMaterial>;
      mesh.userData = {
        ...mesh.userData,
        isHiglighted: false,
      };
    });

    this._highlightObjects.clear();
    return this;
  }

  clone(): Highlighter {
    return new Highlighter(this._highlightObjects);
  }
}
