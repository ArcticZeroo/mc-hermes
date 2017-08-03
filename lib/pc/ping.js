const net = require("net");
const Buffer = require("./pc-buffer");
const DEFAULT_PORT = 25565;
const DEFAULT_PROTOCOL = 47;

function ping(server, port = DEFAULT_PORT, timeout = 3000, protocol = DEFAULT_PROTOCOL) {
    return new Promise((resolve, reject)=>{
        if (typeof port !== "number") {
            if (isNaN(port)) {
                port = DEFAULT_PORT;
            } else {
                port = parseInt(port);
            }
        }

        // Use the specified protocol version, if supplied
        if (typeof protocol !== "number") {
            if (isNaN(protocol)) {
                protocol = DEFAULT_PROTOCOL;
            } else {
                protocol = parseInt(protocol);
            }
        }

        const socket = net.connect({
            port: port,
            host: server
        }, function() {
            // Write out handshake packet.
            const handshakeBuffer = new Buffer();

            handshakeBuffer
                .writeVarInt(protocol)
                .writeString(server)
                .writeUShort(port)
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

        socket.setTimeout(timeout, function () {
            reject(new Error(`Socket timed out when connecting to ${server}:${port}`));

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
