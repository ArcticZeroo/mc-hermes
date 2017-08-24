const pc = require('./lib/pc/ping');
const pe = require('./lib/pe/ping');

const PE_ALIASES = ['pe', 'pocket', 'bedrock', 'mco'];

/**
 * Ping a PC or PE server and return the result as an object.
 * @param {object} [opts={}] - Options to use.
 * @param opts.server {number} - The server to ping.
 * @param {string} [opts.type=pc] - The type of server to ping. This should be pc or pe.
 * @param {number} [opts.protocol=47] - The PC protocol version to ping with, if using pc.
 * @param {number} [opts.port] - The port to ping.
 * @param {number} [opts.timeout] - Time in ms to wait before timing out a ping.
 * @return {Promise}
 */
function ping(opts = {}) {
    if (opts.type && PE_ALIASES.includes(opts.type.toLowerCase())) {
        return pe(opts);
    } else {
        return pc(opts);
    }
}

ping.pc = pc;
ping.pe = pe;

module.exports = ping;