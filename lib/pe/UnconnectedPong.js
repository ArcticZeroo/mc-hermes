const Raknet = require('./Raknet');

class UnconnectedPong {
    constructor(buff) {
        this.buff = buff;
        this.buff.offset = 1;
    }

    decode() {
        this.pingId = this.buff.readLong();

        this.serverId = this.buff.readLong();

        this.buff.offset += 16;

        this.nameLength = this.buff.readShort();

        try {
            this.advertiseString = this.buff.readUTF8String(this.nameLength);
        } catch (e) {
            this.advertiseString = this.buff.readUTF8String(parseInt((e.message.substr(e.message.indexOf(',')+2, 3))));
        }

        const split = this.advertiseString.split(';');

        this.data = {
            gameId: split[0],
            name: split[1],
            description: split[1],
            unknownId: split[2],
            version: {
                name: split[3]
            },
            players: {
                online: split[4],
                max: split[5]
            },
            type: 'pe'
        }
    }
}

module.exports = UnconnectedPong;