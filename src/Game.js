import {Container, autoDetectRenderer, utils as pixiUtils} from 'pixi.js';
import {fromEvent, combineLatest, interval, merge, Scheduler} from 'rxjs';
import {startWith, debounceTime} from 'rxjs/operators';
import Player from './Player';

/**
 * Create infinite loop as a stream.
 */
const animationFrame$ = interval(0, Scheduler.requestAnimationFrame);

/**
 * @returns {Object}
 */
const getWindowSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

/**
 * Create observable of resize and orientation change.
 * All data will be mapped in object like:
 *
 *   {
 *     width: number,
 *     height: number,
 *   }
 *
 */
const resize$ = merge(
  fromEvent(window, 'resize', getWindowSize),
  fromEvent(window, 'orientationChange', getWindowSize),
).pipe(
  // Avoid massive resize changes
  debounceTime(200),
  // Set initial value. Also helps to start working 'combineLatest' immediatedly
  startWith(getWindowSize()),
);

/**
 * Literal names for key codes
 */
const DIRECTION_KEY = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  NONE: -1, // Indicates as stop sign.
};

/**
 * Operate with key codes to define offset for player object
 */
const CODE_TO_DIRECTION_MAP = {
  [DIRECTION_KEY.LEFT]: {x: -1, y: 0},
  [DIRECTION_KEY.UP]: {x: 0, y: -1},
  [DIRECTION_KEY.RIGHT]: {x: 1, y: 0},
  [DIRECTION_KEY.DOWN]: {x: 0, y: 1},
  [DIRECTION_KEY.NONE]: {x: 0, y: 0},
};

/**
 * Observer for keyboard events. Returns pressed key
 * Or -1 in case of non supported key.
 */
const keyboard$ = merge(
  fromEvent(document, 'keydown', ({keyCode}) =>
    Object.values(DIRECTION_KEY).includes(keyCode)
      ? keyCode
      : DIRECTION_KEY.NONE,
  ),
  fromEvent(document, 'keyup', () => DIRECTION_KEY.NONE),
).pipe(startWith(DIRECTION_KEY.NONE));

/**
 * Main game class.
 * Creates player, flying things and all other interacitive things.
 */
export default class Game {
  /**
   * @param {Object} DOMNode - DOM node where mount scene
   */
  constructor(DOMNode) {
    // Disable console pixi.js text about plugin
    pixiUtils.skipHello();

    const {width, height} = getWindowSize();

    // Create renderer
    this.renderer = autoDetectRenderer(
      // @todo Move width & height to RxStream based on resize or orientation change
      width,
      height,
      {
        transparent: true,
        forceFXAA: true,
        antialias: true,
        resolution: window.devicePixelRatio,
        view: DOMNode,
      },
    );

    // Create root container that will hold the scene that we will draw in future
    this.stage = new Container();

    this.createPlayer();

    // Create infinite rendering loop
    combineLatest(animationFrame$, resize$, keyboard$).subscribe(this.render);
  }

  createPlayer() {
    const size = getWindowSize();

    this.player = new Player(this.stage, size);

    this.player.setPosition({
      x: size.width / 2,
      y: size.height - 50,
    });
  }

  /**
   * @param {number} newWidth
   * @param {number} newHeight
   */
  resize(newWidth, newHeight) {
    const {width, height} = this.renderer.screen;

    // console.log('current: ', width, height);
    // console.log('new: ', newWidth, newHeight)

    if (width !== newWidth || height !== newHeight) {
      // It will trigger resize
      this.player.setArea({
        width: newWidth,
        height: newHeight,
      });

      // Update all screen
      this.renderer.view.style.width = `${newWidth}px`;
      this.renderer.view.style.height = `${newHeight}px`;
      this.renderer.resize(newWidth, newHeight);
    }
  }

  /**
   * Core of application. This method will be triggered on each request animation frame
   * @param {Array} subscription
   * @param {number} subscription[0] - request animation frame tick interval
   * @param {number} subscription[1] - screen size as a pair of 'width' and 'height'
   */

  // eslint-disable-next-line no-unused-vars
  render = ([frame, screenSize, keyCode]) => {
    this.resize(screenSize.width, screenSize.height);

    this.player.updatePositionByOffset(CODE_TO_DIRECTION_MAP[keyCode]);

    this.renderer.render(this.stage);
  };
}
