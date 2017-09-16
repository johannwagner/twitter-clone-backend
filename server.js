/**
 * Created by Johann on 04/09/2017.
 */

const express = require('express');
const _ = require('lodash');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const tweetsRouter = require('./routers/tweetsRouter');
const userRouter = require('./routers/userRouter');
const tokenRouter = require('./routers/tokenRouter');

app.use(cors());
app.use(bodyParser.json());


app.use('/users', userRouter);
app.use('/token', tokenRouter);
app.use('/tweets', tweetsRouter);

app.listen(3002);