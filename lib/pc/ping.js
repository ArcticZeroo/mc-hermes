const net = require("net");
const Buffer = require("./pc-buffer");
const DEFAULT_PORT = 25565;
const DEFAULT_PROTOCOL = 47;

/**
 * Ping a PC server and return the result as JSON.
 * @param {object} [opts={}] - Options to use.
 * @param opts.server {number} - The server to ping.
 * @param {number} [opts.port=25565] - The port to ping.
 * @param {number} [opts.timeout=3000] - Time in ms to wait before timing out a ping.
 * @param {number} [opts.protocol=47] - The minecraft protocol to ping with.
 * @return {Promise}
 */
function ping(opts = {}) {
    return new Promise((resolve, reject)=>{
        if (typeof opts === 'string') {
            opts = {
                server: opts
            }
        }
        
        //server, port = DEFAULT_PORT, timeout = 3000, protocol = DEFAULT_PROTOCOL
        opts = Object.assign({
            port: DEFAULT_PORT,
            timeout: 3000,
            protocol: DEFAULT_PROTOCOL
        }, opts);

        // Use the specified port, if supplied
        if (typeof opts.port !== 'number') {
            if (isNaN(opts.port)) {
                opts.port = DEFAULT_PORT;
            } else {
                opts.port = parseInt(opts.port);
            }
        }

        // Use the specified protocol version, if supplied
        if (typeof opts.protocol !== 'number') {
            if (isNaN(opts.protocol)) {
                opts.protocol = DEFAULT_PROTOCOL;
            } else {
                opts.protocol = parseInt(opts.protocol);
            }
        }

        const socket = net.connect({
            port: opts.port,
            host: opts.server
        }, function() {
            // Write out handshake packet.
            const handshakeBuffer = new Buffer();

            handshakeBuffer
                .writeVarInt(opts.protocol)
                .writeString(opts.server)
                .writeUShort(opts.port)
                .writeVarInt(1);

            writePCBuffer(socket, handshakeBuffer);

            // Write the set connection state packet, we should get the MOTD after this.
            const setModeBuffer = new Buffer().writeVarInt(0);

            writePCBuffer(socket, setModeBuffer);
        });

        function destroy() {
            socket.destroy();
            socket.removeAllListeners();
        }

        socket.setTimeout(opts.timeout, function () {
            reject(new Error(`Socket timed out when connecting to ${opts.server}:${opts.port}`));

            socket.destroy();
        });

        let readingBuffer = new Buffer(0);

        socket.on('data', function(data) {
            readingBuffer = Buffer.concat([readingBuffer, data]);

            const buffer = new Buffer(readingBuffer);
            let length;

            try {
                length = buffer.readVarInt();
            } catch(err) {
                // The buffer isn't long enough yet, wait for more data!
                return;
            }

            // Make sure we have the data we need!
            if (readingBuffer.length < length - buffer.offset() ) {
                return;
            }

            // Read the packet ID, throw it away.
            buffer.readVarInt();

            try {
                // We parsed it, send it along!
                resolve(JSON.parse(buffer.readString()));
            } catch (err) {
                // Our data is corrupt? Fail hard.
                reject(err);
                return;
            }

            // We're done here.
            socket.destroy();
        });

        socket.once('error', function(err) {
            reject(err);
            socket.destroy();
        });
    });
}

// Wraps our Buffer into another to fit the Minecraft protocol.
function writePCBuffer(client, writeFrom) {
    const writeTo = new Buffer().writeVarInt(writeFrom.buffer.length);

    client.write(Buffer.concat([writeTo.buffer, writeFrom.buffer]));
}

module.exports = ping;
