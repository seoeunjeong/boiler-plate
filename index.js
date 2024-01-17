const express = require('express');
const app = express();
const port = 5000;

const mongoose = require('mongoose');
mongoose
  .connect('mongodb+srv://seocoding1:abcd1234@boilerplate.czkfivk.mongodb.net/')
  .then(() => console.log('MongoDB Connectd..'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!안녕하세요!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
