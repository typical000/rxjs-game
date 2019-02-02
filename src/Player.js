import {Graphics} from 'pixi.js';

/**
 * Player class. We can interact with him via keyboard.
 * Just draws a figure and exposes some methods for controlling it's position.
 */
export default class Player {
  constructor(stage, areaSize) {
    this.graphics = new Graphics();

    // Available area where player can be situated
    this.areaSize = areaSize;

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
      x: this.x,
      y: this.y,
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
    if (x === this.x && y === this.y) {
      return this;
    }

    if (this.isOutsideOfArea({x, y})) {
      return this;
    }

    this.x = x;
    this.y = y;
    this.draw();

    return this;
  }

  /**
   * Correct element position, passing offset where we must move it
   * @param {Object} position
   * @param {number} position.x
   * @param {number} position.y
   * @public
   */
  updatePositionByOffset({x, y}) {
    const updatedX = this.x + x;
    const updatedY = this.y + y;
    // Avoid unneded redraws
    if (updatedX === this.x && updatedY === this.y) {
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

    this.x = updatedX;
    this.y = updatedY;
    this.draw();

    return this;
  }

  /**
   * @public
   */
  draw() {
    const {x, y, radius} = this;

    this.graphics.clear();
    this.graphics.lineStyle(this.lineThikness, this.lineColor);
    // prettier-ignore
    this.graphics.drawPolygon(
      x, y - radius,
      x + radius, y + radius,
      x - radius, y + radius,
      x, y - radius,
    );

    return this;
  }
}
