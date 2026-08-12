const Pusher = require('pusher');

let instance = null;

function getPusher() {
  if (instance) return instance;

  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    throw new Error('Credenciais do Pusher não configuradas (PUSHER_APP_ID / PUSHER_KEY / PUSHER_SECRET / PUSHER_CLUSTER).');
  }

  instance = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });

  return instance;
}

function roomChannel(code) {
  return `room-${String(code).toUpperCase().trim()}`;
}

/** Broadcasts an event to every client subscribed to a room. */
async function broadcast(code, event, payload) {
  await getPusher().trigger(roomChannel(code), event, payload);
}

module.exports = { getPusher, roomChannel, broadcast };
