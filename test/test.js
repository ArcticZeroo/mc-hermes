const assert = require('assert');
const pc = require('../lib/pc/ping');
const pe = require('../lib/pe/ping');

async function backwardsResolve(promise) {
    const msg = 'Promise resolved normally';

    try {
        await promise;

        //noinspection ExceptionCaughtLocallyJS
        throw new Error(msg);
    } catch(e) {
        if (e.message === msg) {
            throw e;
        }
    }

    return undefined;
}

describe('PC Ping', function () {
    it('should reject when given an invalid host', async function () {
        return backwardsResolve(pc({
            server: 'awuhduiahwfuihauiw.com'
        }));
    });

    it('should reject when given a negative port', async function () {
        return backwardsResolve(pc({
            server: 'us.mineplex.com',
            port: -1
        }));
    });

    it('should respect the timeout option', async function () {
        // Hopefully mineplex will never ping within 10ms...
        return new Promise((resolve, reject)=>{
            pc({
                server: 'us.mineplex.com',
                timeout: 10
            }).then(()=> reject('Did not time out')).catch((e)=>{
                if((e.message || e).includes('timed out')) {
                    resolve('Timed out');
                } else {
                    reject('Did not time out');
                }
            });
        });
    });

    it('should be able to ping PC servers', async function () {
        return pc({
            server: 'us.mineplex.com',
            timeout: 2000
        });
    });

    it('should have version.name, players.max, players.online, and description', async function () {
        return pc({
            server: 'us.mineplex.com',
            timeout: 2000
        }).then((r)=>{
            assert(r.version.name != null, 'should have version.name');
            assert(r.players.max != null, 'should have players.max');
            assert(r.players.online != null, 'should have players.online');
            assert(r.description != null, 'should have description');
        });
    });
});

describe('PE Ping', function () {
    it('should reject when given an invalid host', async function () {
        return backwardsResolve(pe({
            server: 'ashcuahwdjhauiwdhui.com'
        }));
    });

    it('should reject when given a negative port', async function () {
        return backwardsResolve(pe({
            server: 'pe.mineplex.com',
            port: -1
        }));
    });

    it('should respect the timeout option', async function () {
        // Hopefully mineplex will never ping within 10ms...
        return new Promise((resolve, reject)=>{
            pe({
                server: 'pe.mineplex.com',
                timeout: 10
            }).then(()=> reject('Did not time out')).catch((e)=>{
                if((e.message || e).includes('timed out')) {
                    resolve('Timed out');
                } else {
                    reject('Did not time out');
                }
            });
        });
    });

    it('should be able to ping PE servers', async function () {
        return pe({
            server: 'pe.mineplex.com',
            timeout: 2000
        });
    });

    it('should have version.name, players.max, players.online, and description', async function () {
        return pe({
            server: 'pe.mineplex.com',
            timeout: 2000
        }).then((r)=>{
            assert(r.version.name != null, 'should have version.name');
            assert(r.players.max != null, 'should have players.max');
            assert(r.players.online != null, 'should have players.online');
            assert(r.description != null, 'should have description');
        });
    });
});