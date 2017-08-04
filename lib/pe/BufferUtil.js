class BufferUtil {
    static readString(buffer) {
        const start = buffer.offset;

        let i;
        do {
            i = buffer.readUInt8();
        } while (i !== 0x0);

        return buffer.toString('utf8', start, buffer.offset - 1);
    }
}

module.exports = BufferUtil;