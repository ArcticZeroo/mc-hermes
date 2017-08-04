const ByteBuffer = require('bytebuffer');
const Raknet = require('./Raknet');

class UnconnectedPing {
    constructor(pingId) {
        this.pingId = pingId;

        this.buff = new ByteBuffer();
        this.buff.buffer[0] = Raknet.UNCONNECTED_PING;
        this.buff.offset = 1;
    }

    encode() {
        this.buff
            .writeLong(this.pingId)
            .append(Raknet.MAGIC, 'hex')
            .writeLong(0)
            .flip()
            .compact();
    }
}

module.exports = UnconnectedPing;