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

    it('should respect the timeout option', async function () {
        // Hopefully mineplex will never ping within 10ms...
        return new Promise((resolve, reject)=>{
            pc({
                server: 'us.mineplex.com',
                timeout: 10
            }).then(reject).catch((e)=>{
                if((e.message || e).includes('Socket timed out')) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    });

    it('should be able to ping servers', async function () {
        return pc({
            server: 'us.mineplex.com',
            timeout: 2000
        }).then((d)=>{
            assert.equal(typeof d, 'object');
        });
    });
});

describe('PE Ping', function () {
    it('should reject when given an invalid host', async function () {
        return backwardsResolve(pe({
            server: 'ashcuahwdjhauiwdhui.com'
        }));
    });

    it('should respect the timeout option', async function () {
        // Hopefully mineplex will never ping within 10ms...
        return new Promise((resolve, reject)=>{
            pe({
                server: 'us.mineplex.com',
                timeout: 10
            }).then(reject).catch((e)=>{
                if((e.message || e).includes('timed out')) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    });

    it('should be able to ping server', async function () {
        return pe({
            server: 'pe.mineplex.com',
            timeout: 2000
        }).then((d)=>{
            assert.equal(typeof d, 'object');
        });
    });
});