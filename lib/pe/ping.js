const dgram = require('dgram');
const ByteBuffer = require('bytebuffer');
const dns = require('dns');

const Raknet = require('./Raknet');
const UnconnectedPing = require('./UnconnectedPing');
const UnconnectedPong = require('./UnconnectedPong');

const DEFAULT_PORT = 19132;
const DEFAULT_TIMEOUT = 3000;

const START_TIME = Date.now();

function isIPv4(entry) {
    const blocks = entry.split('.');
    if (blocks.length === 4) {
        return blocks.map(b => parseInt(b, 10)).every(b => b >= 0 && b <= 255);
    }
    return false;
}

function _pingIP(opts) {
    return new Promise((resolve, reject)=>{
        const client = dgram.createSocket('udp4');

        const clientTimeout = setTimeout(function () {
            destroy(`Ping timed out when connecting to ${opts.server}:${opts.port}`);
        }, opts.timeout);

        function destroy(reason) {
            clearTimeout(clientTimeout);
            client.close();
            client.removeAllListeners();

            if (reason) {
                reject(new Error(reason));
            }
        }

        try {
            const ping = new UnconnectedPing(Date.now() - START_TIME);
            ping.encode();
            client.send(ping.buff.buffer, 0, ping.buff.buffer.length, opts.port, opts.server);
        } catch (e) {
            destroy(`Unable to send ping: ${e.message || e}`);
            return;
        }

        client.on('message', function (msg) {
            const buff = new ByteBuffer().append(msg, 'hex').flip();
            const id = buff.buffer[0];

            if (id === Raknet.UNCONNECTED_PONG) {
                destroy();

                const pong = new UnconnectedPong(buff);
                pong.decode();
                resolve(pong.data);
            }
        })
    });
}

/**
 * Ping a PE server and return the result as JSON.
 * @param {object} [opts={}] - Options to use.
 * @param opts.server {number} - The server to ping.
 * @param {number} [opts.port=19132] - The port to ping.
 * @param {number} [opts.timeout=3000] - Time in ms to wait before timing out a ping.
 * @return {Promise}
 */
function ping(opts = {}) {
    return new Promise((resolve, reject)=>{
        opts = Object.assign({
            port: DEFAULT_PORT,
            timeout: DEFAULT_TIMEOUT
        }, opts);

        if (isIPv4(opts.server)) {
            resolve(_pingIP(opts));
        } else {
            dns.lookup(opts.server, (err, res)=>{
                if (err) {
                    reject(new Error(`DNS lookup failed: ${err.message || err}`));
                } else {
                    opts.server = res;
                    _pingIP(opts).then(resolve).catch(reject);
                }
            });
        }
    });
}

module.exports = ping;