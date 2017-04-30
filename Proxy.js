
//NEED APACHE TO CONNECT TO LOCAL HOST//
'use strict';                     //strict is a literal expression ignored by earlier versions of js.with strict enabled you cannot use undeclared variables.
var http = require('http');       //built in function easiest way to include modules. Reads a js file executes the file, and returns the exports object. node.js provides an http module. Can be used to create an HTTP client of a server.
var port = process.env.PORT || 1337;  //process.env property returns an object containing the user enviroment
var net = require('net');
var url = require('url');


//createserver is a web server object and is essential to this program. function thats passed into it is called once every http request that is made and is called the request handler
     const proxy = http.createServer(function (req, res) { //req is an object containing info about the http request that raised the event and res is used to send back the http response.
    res.writeHead(200, { 'Content-Type': 'text/plain' });//writehead sends a response header to the request. or a status code that is a 3 digit http status code the last potential argument is headers. optionally you can have a statusmessage as the second argument.
    //first argument 200, is a statuscode and the ones with single quotes are headers.
    res.end('Hello World\n'); //end prints string to screen
});//.listen(port);//listen is used to begin accepting connections


proxy.on('connect', (req, cltSocket, head) => {
    // connect to an origin server
    const srvUrl = url.parse(`http://${req.url}`);
    const srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
        cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
            'Proxy-agent: Node.js-Proxy\r\n' +
            '\r\n');
        srvSocket.write(head);
        srvSocket.pipe(cltSocket);
        cltSocket.pipe(srvSocket);
    });
});

// now that proxy is running
proxy.listen(1337, '127.0.0.1', () => {
    //original host name: 127.0.0.1
    //my remote port:54668
    // make a request to a tunneling proxy
    const options = {
        port: 1337,
        hostname: '127.0.0.1',
        method: 'CONNECT',
        path: 'www.google.com:80'
    };

    const req = http.request(options);
    req.end();

    req.on('connect', (res, socket, head) => {
        console.log('got connected!');

        // make a request over an HTTP tunnel
        socket.write('GET / HTTP/1.1\r\n' +
            'Host: www.google.com:80\r\n' +
            'Connection: close\r\n' +
            '\r\n');
        socket.on('data', (chunk) => {
            console.log(chunk.toString());
        });
        socket.on('end', () => {
            proxy.close();
        });
    });
});
