require('dotenv').config();
const express = require('express');
const consign = require('consign');
const app = express();


consign({cwd: 'src'})
    .include('db.js')
    .then('models')
    .then('middlewares.js')
    .then('routes')
    .then('boot.js')
    .into(app);

