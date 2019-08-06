#!/usr/bin/env node
const express = require('express');
const app = express();
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT, 10) || 8080;//8080
const publicDir = process.argv[2] || __dirname + '/public';
const path = require('path');

// library for signing tokens
const jwt = require('jsonwebtoken');
const fs = require('fs');

app.get('/', function (req, res) {
  res.sendFile(path.join(publicDir, '/index.html'));
});

const private_key = fs.readFileSync('AuthKey_4MR8KL2MS6.p8').toString(); // read your private key from your file system
const team_id = '53DNG3Q3GT'; // your 10 character apple team id, found in https://developer.apple.com/account/#/membership/
const key_id = '4MR8KL2MS6'; // your 10 character generated music key id. more info https://help.apple.com/developer-account/#/dev646934554
const token = jwt.sign({}, private_key, {
  algorithm: 'ES256',
  expiresIn: '180d',
  issuer: team_id,
  header: {
    alg: 'ES256',
    kid: key_id
  }
});

app.get('/token', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({token: token}));
});

// app.get('/token', function (req, res) {
//     res.setHeader('Content-Type', 'application/json');
//     res.send(JSON.stringify({token: token}));
//   });

app.use(express.static(publicDir));

console.log('Listening at', publicDir, hostname, port);
app.listen(port, hostname);
