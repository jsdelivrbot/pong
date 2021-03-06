import EventEmitter from 'events';
import KEY from 'constants/key';

/**
 * Emitter for Keyboard events
 */
export const inputEmitter = new EventEmitter();

/**
 * when a key is down
 *
 * @param (KeyboardEvent) e
 */
export function onKeyDown(e) {
  const keycode = e.keyCode;

  // A Key is 65
  // Left arrow is 37
  if (keycode === KEY.A || keycode === KEY.LEFT) {
    inputEmitter.emit('leftDown');
    return;
  };

  // D Key is 68
  // Right arrow is 39
  if (keycode === KEY.D || keycode === KEY.RIGHT) {
    inputEmitter.emit('rightDown');
    return;
  };

  if (keycode === KEY.P || keycode === KEY.ESCAPE) {
    inputEmitter.emit('pauseDown');
    return;
  };
};

/**
 * when a key is up
 *
 * @param (KeyboardEvent) e
 */
export function onKeyUp(e) {
  const keycode = e.keyCode;

  // A Key is 65
  // Left arrow is 37
  if (keycode === KEY.A || keycode === KEY.LEFT) {
    inputEmitter.emit('leftUp');
    return;
  };

  // D Key is 68
  // Right arrow is 39
  if (keycode === KEY.D || keycode === KEY.RIGHT) {
    inputEmitter.emit('rightUp');
    return;
  };
};

// attach events
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);
