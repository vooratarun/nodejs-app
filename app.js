// app.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Node.js on Minikube! trigger');
});

app.get('/health', (req, res) => {
  res.send('OK');
});

module.exports = app;

