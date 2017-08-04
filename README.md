# mc-hermes

This is a library to ping both `pc` and `pe` servers.

The library uses a significant portion of both [mc-ping-updated](https://github.com/Cryptkeeper/mc-ping-updated) and [mcpe-ping](https://github.com/Falkirks/mcpe-ping). Thanks to both of you for the base code. 

I've essentially just cleaned up a few bits, converted all parameters to a single object, somewhat standardized the response, and made it use promises instead of callbacks.

As said prior, all parameters are just a single object passed as the only argument.

Valid parameters are `server` (the hostname/ip), `port` (the port, duh), `timeout` (time in ms for the ping to time out), `type` (if not using `ping.pe` or `ping.pc`), and `protocol` (protocol version to use if pinging PC). 

Only `server` is required, and `type` defaults to pc.

Usage:

```javascript
const ping = require('mc-hermes');

// PE Ping
ping({
    type: 'pe',
    server: 'pe.mineplex.com'
})
    .then((data)=>{
        console.log(`Online players: ${data.players.online}`);
    })
    .catch(console.error);

// PC Ping
ping({
    type: 'pc',
    server: 'us.mineplex.com'
})
    .then((data)=>{
        console.log(`Online players: ${data.players.online}`);
    })
    .catch(console.error);

// Also a PC ping
ping.pc({ server: 'us.mineplex.com' })
    .then((data)=>{
        console.log(`Online players: ${data.players.online}`);
    })
    .catch(console.error);
```

For both PC and PE, a successful resolution will pass a JSON object as documented here: [http://wiki.vg/Server_List_Ping#Response](http://wiki.vg/Server_List_Ping#Response)

PE does not have a few fields that PC does, such as the favicon. However, `version.name`, `players.max`, `players.online`, and `description` exist for both PC and PE, to provide a somewhat consistent format to find player counts across the two platforms. 