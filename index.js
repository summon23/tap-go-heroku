'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const core = require('./method');
const config = require('./config');
// Load Env File
// config.loadEnvironment();
const PORT = process.env.PORT;

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(cors({
   origin: 'http://localhost:8080',
   credentials: true
}));

// Register Method
core.registerMethod(app);

app.use(function(req, res, next){
    res.status(404);
    res.send({ error: 'Not found' });
});

app.listen(PORT, () => {
   console.log(`running on ${PORT}`);
});
