class PCBuffer {
    /**
     * @param {Buffer|PCBuffer|number} [existingBuffer] - An existing buffer to use if applicable
     */
    constructor(existingBuffer) {
        this._buffer = existingBuffer || new Buffer(48);
        this._offset = 0;
    }

    writeVarInt(val) {
        while (true) {
            if ((val & 0xFFFFFF80) === 0) {
                this.writeUByte(val);

                return this;
            }

            this.writeUByte(val & 0x7F | 0x80);

            val = val >>> 7;
        }
    }

    writeString(string) {
        this.writeVarInt(string.length);

        if (this._offset + string.length >= this._buffer.length) {
            Buffer.concat([this._buffer, new Buffer(string.length)]);
        }

        this._buffer.write(string, this._offset, string.length, 'UTF-8');

        this._offset += string.length;

        return this;
    }

    writeUByte(val){
        if (this._offset + 1 >= this._buffer.length) {
            Buffer.concat([this._buffer, new Buffer(50)]);
        }

        this._buffer.writeUInt8(val, this._offset++);

        return this;
    }

    writeUShort(val) {
        this.writeUByte(val >> 8);
        this.writeUByte(val & 0xFF);

        return this;
    }

    readVarInt(){
        let val = 0;
        let count = 0;

        while (true) {
            let i = this._buffer.readUInt8(this._offset++);

            val |= (i & 0x7F) << count++ * 7;

            if ((i & 0x80) !== 128) {
                break;
            }
        }

        return val;
    }

    readString() {
        const length = this.readVarInt();
        const str = this._buffer.toString("UTF-8", this._offset, this._offset + length);

        this._offset += length;

        return str;
    }
    
    get buffer() {
        return this._buffer.slice(0, this._offset);
    }
    
    get offset() {
        return this._offset;
    }
}

module.exports = PCBuffer;