const express = require("express");
const app = express();
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const serveStatic = require("serve-static");
const dogs = require("./dogs");
const cats = require("./cats");

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.JWT_JWKS_URI
  }),
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_ISSUER,
  algorithms: ["RS256"]
});

// A public API endpoint returning dog pictures
app.get("/api/dog", (req, res) => {
  res.json({
    url: `${req.protocol}://${req.get("host")}/images/dogs/${
      dogs[Math.floor(Math.random() * dogs.length)]
    }`
  });
});

// A private API endpoint returning cat pictures
app.get("/api/cat", jwtCheck, (req, res) => {
  res.json({
    url: `${req.protocol}://${req.get("host")}/images/cats/${
      cats[Math.floor(Math.random() * cats.length)]
    }`
  });
});

app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send({ error: err.message });
  }
});

// Tell the server what port to listen on
app.listen(PORT, () => {
  console.log("Listening on localhost:3000");
});
