import {Graphics, DEG_TO_RAD} from 'pixi.js';

/**
 * Maximal rotation average for plater when it moves left/right
 */
const MAX_ROTATION = DEG_TO_RAD * 45;

/**
 * Player class. We can interact with him via keyboard.
 * Just draws a figure and exposes some methods for controlling it's position.
 */
export default class Player {
  constructor(stage, areaSize) {
    this.graphics = new Graphics();

    // Available area where player can be situated
    this.areaSize = areaSize;

    // Nothing, will be set in 'setPosition'
    this.x = null;
    this.y = null;

    this.graphics.angle = 0;

    this.radius = 10;
    this.lineThikness = 1;
    this.lineColor = 0xf1d600;

    // Don't leave thing detached. Attach to stage passed.
    stage.addChild(this.graphics);
  }

  /**
   * @returns {Object} pair of X and Y coordinates.
   */
  getPosition() {
    return {
      x: this.graphics.x,
      y: this.graphics.y,
    };
  }

  /**
   * @param {Object} position
   * @param {number} position.x
   * @param {number} position.y
   * @returns {bool}
   */
  isOutsideOfArea({x, y}) {
    const {width, height} = this.areaSize;
    return x < 0 || x > width || y < 0 || y > height;
  }

  /**
   * Update scene size.
   * @param {Object} newAreaSize
   * @param {number} newAreaSize.x
   * @param {number} newAreaSize.y
   * @public
   */
  setArea(newAreaSize) {
    const {x, y} = this.getPosition();

    this.setPosition({
      x: Math.round(x / (this.areaSize.width / newAreaSize.width)),
      y: Math.round(y / (this.areaSize.height / newAreaSize.height)),
    });

    this.areaSize = newAreaSize;
  }

  /**
   * Set absolute position of element
   * @param {Object} position
   * @param {number} position.x
   * @param {number} position.y
   * @public
   */
  setPosition({x, y}) {
    // If posiiton is the same - avoid redraw
    if (x === this.graphics.x && y === this.graphics.y) {
      return this;
    }

    if (this.isOutsideOfArea({x, y})) {
      return this;
    }

    this.graphics.x = x;
    this.graphics.y = y;
    this.draw();

    return this;
  }

  /**
   * @param {number} deg
   */
  rotateBy(deg) {
    const newRotation = this.graphics.rotation + DEG_TO_RAD * deg;
    if (newRotation <= MAX_ROTATION && newRotation >= -MAX_ROTATION) {
      this.graphics.rotation = newRotation;
    }
  }

  /**
   * Reset rotation to 0 degree. Invocation of this function will restore by 1 degree
   */
  resetRotation() {
    const {rotation} = this.graphics;

    if (rotation !== 0) {
      this.graphics.rotation += rotation > 0 ? -DEG_TO_RAD : DEG_TO_RAD;
    }
  }

  /**
   * Correct element position, passing offset where we must move it
   * @param {Object} position
   * @param {number} position.x
   * @param {number} position.y
   * @public
   */
  updatePositionByOffset({x, y}) {
    const updatedX = this.graphics.x + x;
    const updatedY = this.graphics.y + y;
    // Avoid unneded redraws
    if (updatedX === this.graphics.x && updatedY === this.graphics.y) {
      this.resetRotation();
      return this;
    }

    // Check bounding rectangle of playing area
    if (
      this.isOutsideOfArea({
        x: updatedX,
        y: updatedY,
      })
    ) {
      return this;
    }

    // If X was changed - means that is horizontal move
    if (x) {
      this.rotateBy(x);
    }

    this.graphics.x = updatedX;
    this.graphics.y = updatedY;
    this.draw();

    return this;
  }

  /**
   * @public
   */
  draw() {
    const {radius} = this;

    this.graphics.clear();
    this.graphics.lineStyle(this.lineThikness, this.lineColor);
    // prettier-ignore
    this.graphics.drawPolygon(
      0, - radius,
      radius, radius,
      0, radius / 2,
      -radius, radius,
      0, -radius,
    );

    return this;
  }
}
