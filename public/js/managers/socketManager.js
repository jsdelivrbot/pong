import io from 'socket.io-client';

/**
 * start a connection to the server
 */
const serverUrl = (!window.location.href.includes('localhost')) ? window.location.protocol + '//' + window.location.host : 'http://localhost:666';
const socketManager = io(serverUrl, {
  reconnection: false,
});

export default socketManager;
