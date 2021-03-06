import * as PIXI from 'pixi.js';
import Intersects from 'yy-intersects';

import gameState, {
  updateBallPositionState,
  updateBallVelocityState,
  updatePrimaryPlayerPositionState,
} from 'data/gameState';

import Point from '@studiomoniker/point';

import BallComponent from 'components/BallComponent';
import PlayerComponent from 'components/PlayerComponent';
import ScoreComponent from 'components/ScoreComponent';
import TextComponent from 'components/TextComponent';

import GAME_EVENTS from 'constants/gameEvents';
import { GAME_SIZE } from 'constants/sizes';

import {
  DEFAULT_BALL_SPEED,
  BALL_VELOCITY_LIMITS,
  DEFAULT_PLAYER_ACCELERATION,
  DEFAULT_PLAYER_SPEED,
  PLAYER_VELOCITY_LIMITS,
} from 'constants/physics';

import {
  BALL_DEFAULT_POS,
  GAME_CENTER_POS,
  GAME_BOUNDS,
  PRIMARY_SCORE_POS,
  SECONDARY_SCORE_POS,
} from 'constants/positions';

import { getCanvasContainer } from 'helpers/canvasHelper';
import { createFieldView, createPauseMenu } from 'helpers/pixiGameDrawHelper';

import { gameEmitter } from 'managers/gameManager';

/**
 * singleton for Pixi.js
 *  use this to draw and update the view
 */
const pixiApp = new PIXI.Application(GAME_SIZE);
pixiApp.renderer.backgroundColor = 0x080808;

// render it onto document
const canvas = getCanvasContainer();
canvas.appendChild(pixiApp.view);

// ball
const ball = new BallComponent({
  position: BALL_DEFAULT_POS,
  velocity: new Point(DEFAULT_BALL_SPEED, DEFAULT_BALL_SPEED),
  velocityLimits: BALL_VELOCITY_LIMITS,
});

// active player
const primaryPlayer = new PlayerComponent({
  position: gameState.primaryPlayerPos,
  velocityLimits: PLAYER_VELOCITY_LIMITS,
});
primaryPlayer.updateState = () => {
  updatePrimaryPlayerPositionState(primaryPlayer.position);
};

// opposing player
const secondaryPlayer = new PlayerComponent({
  position: gameState.secondaryPlayerPos,
});

// primaryPlayerScore
const primaryScoreComponent = new ScoreComponent({
  position: PRIMARY_SCORE_POS,
  text: gameState.primaryScoreComponent,
});
// secondaryPlayerScore
const secondaryScoreComponent = new ScoreComponent({
  position: SECONDARY_SCORE_POS,
  text: gameState.secondaryPlayerScore,
});
// field
const fieldView = createFieldView();
// pause menu
const pauseMenu = createPauseMenu();
const pauseText = new TextComponent('Paused', {
  position: new Point(GAME_CENTER_POS.x, GAME_CENTER_POS.y),
  fontSize: 32,
});

/**
 * puts the ball back in the middle and overrides velocity
 *  that means we should update the gameState ball's velocity before calling this
 */
function resetBallToCenter() {
  ball.position = BALL_DEFAULT_POS;
  ball.velocity = gameState.ballVelocity || new Point(DEFAULT_BALL_SPEED, DEFAULT_BALL_SPEED);
};
/**
 * set up the components and elements that will show up on the screen
 *
 * todo: this will potentially grow to be unmaintainable, figure out a better solution
 */
function initApp() {
  const stage = pixiApp.stage;

  // draw the field
  stage.addChild(fieldView);

  // draw scores
  stage.addChild(primaryScoreComponent.view);
  stage.addChild(secondaryScoreComponent.view);

  // active player
  stage.addChild(primaryPlayer.view);

  // opposing player
  stage.addChild(secondaryPlayer.view);

  // ball
  stage.addChild(ball.view);

  // draw pause menu
  stage.addChild(pauseMenu);
  stage.addChild(pauseText);

  // ... but turn it off first
  togglePauseMenu(true);
  gameState.isPaused = true;
};
/**
 * turns on the pause menu stuff
 *
 * @param {boolean} [shouldShow]
 */
export function togglePauseMenu(shouldShow) {
  if (typeof shouldShow === 'boolean') {
    pauseMenu.visible = shouldShow;
    pauseText.visible = shouldShow;
    return;
  }

  pauseMenu.visible = !pauseMenu.visible;
  pauseText.visible = !pauseText.visible;
}
/**
 * add a ticker to constantly update the game
 */
function appInitUpdate() {
  pixiApp.ticker.add((delta) => {
    // don't update gameObjects if paused
    if (gameState.isPaused) {
      return;
    }

    // handle state changes
    handleUpdateGameState(delta);

    // ball
    ball.update();

    // active player
    primaryPlayer.update();

    // opposing player
    secondaryPlayer.update();

    // active player's score
    primaryScoreComponent.text = gameState.primaryPlayerScore;
    primaryScoreComponent.update();

    // opposing player's score
    secondaryScoreComponent.text = gameState.secondaryPlayerScore;
    secondaryScoreComponent.update();
  });
};
/**
 * update everything related to the game state
 *
 * @param {Number} delta - I think it's how much time has elapsed since the last update?
 */
function handleUpdateGameState(delta) {
  const primaryPlayerCollisions = ball.getCollisionSide(primaryPlayer);
  const secondaryPlayerCollisions = ball.getCollisionSide(secondaryPlayer);

  // if paddle's left side hit the ball
  if (primaryPlayerCollisions.left || secondaryPlayerCollisions.left) {
    // invert if ball is going right
    if (ball.velocity.x > 0) {
      ball.velocity.invertX();
    };

    ball.velocity.multiplyX(2.0);
    updateBallVelocityState(ball.velocity);
    gameEmitter.emit(GAME_EVENTS.BALL_HIT_PLAYER);
  };

  // if paddle's right side hit the ball
  if (primaryPlayerCollisions.right || secondaryPlayerCollisions.right) {
    // invert if ball is going left
    if (ball.velocity.x < 0) {
      ball.velocity.invertX();
    };

    ball.velocity.multiplyX(2.0);
    updateBallVelocityState(ball.velocity);
    gameEmitter.emit(GAME_EVENTS.BALL_HIT_PLAYER);
  };

  // if ball collides with any player, flip the velocity to go the other direction
  if (primaryPlayerCollisions.top || secondaryPlayerCollisions.bottom) {
    ball.velocity.invertY();

    const yDirection = ball.velocity.y < 0 ? -1 : 1;
    ball.velocity.y = (ball.velocity.y * 1.5) + (3.5 * yDirection);

    updateBallVelocityState(ball.velocity);
    gameEmitter.emit(GAME_EVENTS.BALL_HIT_PLAYER);
  };

  //
  if (primaryPlayerCollisions.top) {
    gameEmitter.emit(GAME_EVENTS.BALL_HIT_PLAYER, GAME_EVENTS.BALL_HIT_PRIMARY_PLAYER);
  }

  const ballBounds = ball.getBounds();

  // top means primary player scored
  if (ballBounds.top < GAME_BOUNDS.top) {
    gameEmitter.emit(GAME_EVENTS.BALL_TO_SECONDARY_END);
  }

  // bottom means other player scored
  if (ballBounds.bottom > GAME_BOUNDS.bottom) {
    gameEmitter.emit(GAME_EVENTS.BALL_TO_PRIMARY_END);
  }

  // update player position
  const playerAccelerationDelta = DEFAULT_PLAYER_ACCELERATION * delta;
  const bounds = primaryPlayer.getBounds();
  if (gameState.primaryPlayerState === 'left') {
    if (primaryPlayer.canMove()) {
      // give a little push if the player was originally going right
      if (primaryPlayer.velocity.x > 0) {
        primaryPlayer.velocity.subtractX(DEFAULT_PLAYER_SPEED);
      }
      primaryPlayer.velocity.subtractX(playerAccelerationDelta);
      primaryPlayer.clampVelocity();
    } else if (bounds.right >= GAME_BOUNDS.right) {
      primaryPlayer.velocity.subtractX(playerAccelerationDelta);
      primaryPlayer.clampVelocity();
    }

  } else if (gameState.primaryPlayerState === 'right') {
    if (primaryPlayer.canMove()) {
      // give a little push if the player was originally going left
      if (primaryPlayer.velocity.x < 0) {
        primaryPlayer.velocity.addX(DEFAULT_PLAYER_SPEED);
      }
      primaryPlayer.velocity.addX(playerAccelerationDelta);
      primaryPlayer.clampVelocity();
    } else if (bounds.left <= GAME_BOUNDS.left) {
      primaryPlayer.velocity.addX(playerAccelerationDelta);
      primaryPlayer.clampVelocity();
    }
  };
  

  // secondary player's position is from the game state
  secondaryPlayer.position = gameState.secondaryPlayerPos;
};
/**
 * completely stop the ticker
 *  (different from pause, because nothing will update)
 */
function freeze() {
  pixiApp.ticker.stop();
};
/**
 * un-stop the ticker freeze
 */
function unfreeze() {
  pixiApp.ticker.start();
};

// finally - start the app
initApp();
// after adding all the components, we can then start a ticker to update everything
appInitUpdate();

export default pixiApp;
export {
  resetBallToCenter,
  freeze,
  unfreeze,
};
