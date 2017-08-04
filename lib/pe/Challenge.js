const ByteBuffer = require('bytebuffer');
const Raknet = require('./Raknet');
const Query = require('./Query');

class Challenge {
    constructor() {
        this.buff = new ByteBuffer();
    }

    encode() {
        this.buff
            .append(Query.MAGIC, 'hex')
            .writeByte(Query.HANDSHAKE)
            .writeInt32(1)
            .flip()
            .compact();
    }
}

module.exports = Challenge;