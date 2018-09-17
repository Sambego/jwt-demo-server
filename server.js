const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const jwtMiddleware = require("express-jwt");
const jwtAuthz = require("express-jwt-authz");
const jwksRsa = require("jwks-rsa");
const bodyParser = require("body-parser");
const serveStatic = require("serve-static");
const dogs = require("./dogs");
const cats = require("./cats");

// In a real world example this would be a signing key and not kept as a var
// in this file.
const SUPER_SECRET = "sambego";

// In a real world example we would not keep these details here, but store
// them encrypted in a database.
const USERNAME = "sambego";
const PASSWORD = "password";

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwtMiddleware({
  secret: SUPER_SECRET,
  algorithms: ["HS256"]
});

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

// A simple authentication endpoint which will check
// for the user sambego/password, and send a JWT back if
// the username/password match
app.post("/api/authenticate", (req, res) => {
  console.log(
    `Authenticating for user "${req.body.username}" and password "${
      req.body.password
    }"`
  );
  console.log(req.body);

  if (req.body.username === USERNAME && req.body.password === PASSWORD) {
    const createdDate = new Date();
    const expiresDate = new Date();
    expiresDate.setFullYear(createdDate.getFullYear() + 1);

    const token = jwt.sign(
      {
        id: 1,
        user: req.body.username,
        iat: createdDate.getTime(),
        exp: expiresDate.getTime()
      },
      SUPER_SECRET
    );

    return res.status(200).send(token);
  }

  return res.status(401).send("The username and password do not match");
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
app.get("/api/cat", checkJwt, (req, res) => {
  res.json({
    url: `${req.protocol}://${req.get("host")}/images/cats/${
      cats[Math.floor(Math.random() * cats.length)]
    }`
  });
});

// Tell the server what port to listen on
app.listen(3000, () => {
  console.log("Listening on localhost:3000");
});
