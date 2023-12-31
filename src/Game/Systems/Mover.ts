import type { DisplayObject } from "pixi.js";

type Vector2 = {
  x: number;
  y: number;
};

const scale = 40;
const gravity = 0.6 / scale;
const drag = 0.00001 / scale;

const terminalVelocity = 10 / scale;
export default class Mover {
  mass: number;
  pos: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  hasGravity: boolean;
  rotation: number;
  constructor(
    x: number,
    y: number,
    mass: number,
    rotation?: number,
    velocity?: Vector2,
    acceleration?: Vector2,
    hasGravity?: boolean
  ) {
    this.pos = { x, y };
    this.velocity = velocity ?? { x: 0, y: 0 };
    this.acceleration = acceleration ?? { x: 0, y: 0 };
    this.hasGravity = hasGravity ?? false;
    this.mass = mass ?? 1;
    this.rotation = rotation ?? 0;
  }

  update(deltaTime: number) {
    this.acceleration.y += this.hasGravity ? gravity : 0;

    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.velocity.x = clamp(this.velocity.x, -2, 2);
    this.velocity.x = clamp(this.velocity.x, -2, 2);

    this.pos.x += this.velocity.x;
    this.pos.y += this.velocity.y;

    this.rotation += (this.velocity.x / 5) * deltaTime;
    //REFACTOR FUTURE
    //----------

    //----------
    this.acceleration.x = 0;
    this.acceleration.y = 0;

    // this.acceleration.x *= drag;
    // this.acceleration.y *= drag;

    // this.acceleration.x = this.acceleration.x < 0 ? 0 : this.acceleration.x;
    // this.acceleration.x = this.acceleration.x < 0 ? 0 : this.acceleration.x;
  }

  applyForce(force: Vector2) {
    force.x /= scale;
    force.y /= scale;
    this.acceleration.x += force.x / this.mass;
    this.acceleration.y += force.y / this.mass;
  }

  clearAcceleration() {
    this.acceleration.x = 0;
    this.acceleration.y = 0;
  }

  clearVelocity() {
    this.velocity.x = 0;
    this.velocity.y = 0;
  }

  setHasGravity(hasGravity: boolean) {
    this.hasGravity = hasGravity;
  }
}

export function clamp(val: number, min?: number, max?: number) {
  if (min && val < min) {
    return min;
  } else if (max && val > max) {
    return max;
  }
  return val;
}
