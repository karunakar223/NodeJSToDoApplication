const express = require("express");

const app = express();

app.get("/", (request, response) => {
  response.send("Hello This is Karunakar From Rajapet.");
});

app.listen(3000);

module.exports = app;
