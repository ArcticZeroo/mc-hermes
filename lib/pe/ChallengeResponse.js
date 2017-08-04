class ChallengeResponse {
    constructor(buff) {
        this.buff = buff;
        this.buff.offset = 1;
    }

    decode() {
        this.clientId = this.buff.readInt32();

        this.challengeToken = parseInt(this.buff.slice(5).toString('utf8'), 10);
    }
}

module.exports = ChallengeResponse;