const passport = require("passport");
const bcrypt = require("bcrypt");

// custom middleware: ensureAuthenticated



module.exports = function(app, db) {
  
  const ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log("redirecting: not authed");
  res.redirect("/");
};
  
  
  app.route("/").get((req, res) => {
    //Change the response to render the Pug template
    res.render("index", {
      title: "Home Page",
      message: "Please login",
      showLogin: true,
      showRegistration: true
    });
  });

  app
    .route("/login")
    .post(
      passport.authenticate("local", { failureRedirect: "/" }),
      (req, res) => {
        //Change the response to render the Pug template
        res.redirect("/profile");
      }
    );

  app.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    //Change the response to render the Pug template
    res.render(process.cwd() + "/views/pug/profile.pug", {
      username: req.user.username
    });
  });

  app.route("/register").post(
    (req, res, next) => {
      db.collection("users").findOne({ username: req.body.username }, function(
        err,
        user
      ) {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect("/");
        } else {
          // before database logic, hash the password
          const hash = bcrypt.hashSync(req.body.password, 12);
          db.collection("users").insertOne(
            {
              username: req.body.username,
              password: hash
            },
            (err, doc) => {
              if (err) {
                res.redirect("/");
              } else {
                next(null, user);
              }
            }
          );
        }
      });
    },
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res, next) => {
      res.redirect("/profile");
    }
  );

  app.use((req, res, next) => {
    res
      .status(404)
      .type("text")
      .send("Not Found");
  });
};
