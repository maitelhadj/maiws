const express = require('express');
const httpProxy = require('http-proxy');
const http = require('http');
const path = require('path');

const app = express();
const apiProxy = httpProxy.createProxyServer();

const port = process.env.PORT || 3080;

const BASE_GATEWAY_URL = 'http://mai.gateway.ws:8080/';

app.use(express.static(__dirname + '/webapp/dist/mai-trad'));

app.all('/gateway/*', (req, res) => {
    apiProxy.web(req, res, { target: BASE_GATEWAY_URL })
});

app.get('/*', (req, res) => res.sendFile(path.join(__dirname)));

const server = http.createServer(app);

server.listen(port, () => console.log(`App running on: http://localhost:${port}`));