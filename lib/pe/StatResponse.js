const BufferUtil = require('./BufferUtil');
const Query = require('./Query');

class StatResponse {
    constructor(buff) {
        this.buff = buff;
        this.buff.offset = 16;
    }

    decode() {
        this.data = {};
        this.players = [];

        let key, value;
        while (this.buff.readUint16(this.buff.offset) !== Query.KEYVAL_END) {
            key = BufferUtil.readString(this.buff);
            value = BufferUtil.readString(this.buff);

            this.data[key] = value;
        }

        this.buff.offset += 11;

        let player = BufferUtil.readString(this.buff);
        while (player.length >= 1) {
            this.players.push(player);
            player = BufferUtil.readString(this.buff);
        }
    }
}

module.exports = StatResponse;