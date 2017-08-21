

module.exports = function(app,passport,LocalStrategy,flash,User) {
  // Registration
    app.get('/register', function(req, res){
        res.render('register');
    });
    app.post('/register', function(req, res){
        var name = req.body.name;
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var password2 = req.body.password2;
        
        // console.log(`You signed up:
        //   ${name}
        //   ${email}
        //   ${username}
        //   ${password}
        //   ${password2}
        // `);
        // Validation
        req.checkBody('username', 'Name is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

        var errors = req.validationErrors();
        if(errors){
            res.render('register',{
                errors: errors
            });
        } else{
            var newUser = new User ({
                name: name,
                email: email,
                username: username,
                password: password
            });
            // use the createUser function defined in the user models
            User.createUser(newUser, function(err, user){
                if(err) throw err;
                console.log(user);
            });

            req.flash('success_msg', 'You are registered and can now register');

            res.redirect('/register');
        }
      // res.redirect('/login');
    });
  // Login
    app.get('/login', function(req, res){
      res.render('login');
    });
    app.post('/login', 
      passport.authenticate('local', {
          successRedirect:'/admin', 
          failureRedirect:'/login',
          failureFlash: true
      }),
      function(req, res){
      res.redirect('/admin');
    });
  // Get Admin only when Authenticated
    app.get('/admin',ensureAuthenticated, function(req, res){
      res.render('admin/admin',{layout:'dashboard'});

    });
  // Log out
    app.get('/logout', function(req, res){
        req.logout();
        console.log("logging out ...")
        req.flash('success_msg', 'You are logged out');
        res.redirect('/');
    });

  passport.use(new LocalStrategy(
    function(username, password, done) {
     User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unknown User'});
      }

      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Invalid password'});
        }
      });
     });
    }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

  function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
      // req.flash('success_msg','You are logged in');
      return next();
    } else {
      req.flash('error_msg','You are not logged in');
      res.redirect('/login');
    }
  }

};
