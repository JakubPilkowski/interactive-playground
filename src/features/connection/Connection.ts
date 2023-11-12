import { nanoid } from "@reduxjs/toolkit";

export default class Connection {
  public readonly id: string;
  public state: IConnectionState;
  public source: string | null;
  public target: string | null;

  constructor({ id, state, target, source }: IConstructor) {
    this.id = id || nanoid();
    this.state =
      state ||
      (typeof target === "string" && typeof source === "string"
        ? ConnectionState.ACTIVE
        : ConnectionState.UNCONNECTED);
    this.source = source;
    this.target = target;
  }

  updateState() {
    if (typeof this.source === "string" && typeof this.target === "string") {
      this.state = ConnectionState.ACTIVE;
    } else if (
      typeof this.source === "string" ||
      typeof this.target === "string"
    ) {
      this.state = ConnectionState.BROKEN;
    } else {
      this.state = ConnectionState.UNCONNECTED;
    }
  }

  pinSource(source: string): this {
    this.source = source;
    this.updateState();
    return this;
  }

  pinTarget(target: string): this {
    this.target = target;
    this.updateState();
    return this;
  }

  unpinSource(): this {
    this.source = null;
    this.updateState();
    return this;
  }

  unpinTarget(): this {
    this.target = null;
    this.updateState();
    return this;
  }

  disconnect(): this {
    this.target = null;
    this.source = null;
    this.updateState();
    return this;
  }

  unparse(): IConnection {
    return {
      id: this.id,
      source: this.source,
      target: this.target,
      state: this.state,
    };
  }

  clone(): Connection {
    return new Connection(this);
  }
}

/**
 * Whether target or source element
 */
export type ConnectionElement = string;

interface IConstructor {
  target: string | null;
  source: string | null;
  id?: string;
  state?: IConnectionState;
}

export const ConnectionState = {
  /**
   * Neither source or target element exist
   */
  UNCONNECTED: "UNCONNECTED",
  /**
   * Whether target or source exist
   */
  BROKEN: "BROKEN",
  /**
   * Both source or target element exist
   */
  ACTIVE: "ACTIVE",
} as const;

export type IConnectionState = keyof typeof ConnectionState;

export interface IConnection {
  id: string;
  state: IConnectionState;
  source: string | null;
  target: string | null;
}
