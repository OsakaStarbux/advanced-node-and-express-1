"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const mongo = require("mongodb").MongoClient;

const routes = require('./routes.js');
const auth = require('./auth.js');

mongo.connect(
  process.env.DATABASE,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err) {
      console.log("Database error: " + err);
    } else {
      console.log("Successful database connection");
      const db = client.db("Passport");
      
      auth(app, db)
      routes(app, db)

      app.listen(process.env.PORT || 3000, () => {
        console.log("Listening on port " + process.env.PORT);
      });
    }
  }
);

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views/pug"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());



fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
