/*
  pixel sizes

  TODO different screen sizes?!
*/

// modern phones are 18:9, but I think most common is 16:9
const GAME_SIZE = {
  width: 340,
  height: 600,
};

const PADDLE_SIZE = {
  width: 85,
  height: 12,
};

const DASH_SIZE = {
  width: 10,
  height: 3,
};

const PLAYER_TRAITS = {
  speed: 3
}

const PLAYER_LIMITS = {
  rightEnd: (GAME_SIZE.width / 2) - (PADDLE_SIZE.width/2),
  leftEnd: (GAME_SIZE.width/2 * -1) + (PADDLE_SIZE.width/2)
};

export {
  DASH_SIZE,
  GAME_SIZE,
  PADDLE_SIZE,
  PLAYER_LIMITS,
  PLAYER_TRAITS
}
