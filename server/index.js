require('dotenv').config();

const express = require('express')
    , bodyParser = require('body-parser')
    , passport = require('passport')
    , Auth0Strategy = require('passport-auth0')
    , massive = require('massive')
    , session = require('express-session');

const app = express();

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../build'));

massive(process.env.CONNECTION_STRING).then( db => {
   app.set('db', db);
})

passport.use(new Auth0Strategy({
  domain: process.env.AUTH_DOMAIN,
  clientID: process.env.AUTH_CLIENT_ID,
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  callbackURL: process.env.AUTH_CALLBACK
}, function(accessToken, refreshToken, extraParams, profile, done) {

  profile.identities[0].user_id = profile.identities[0].user_id.toString();

  const db = app.get('db');

  db.find_user([ profile.identities[0].user_id ])
  .then( user => {
   if ( user[0] ) {

     db.find_balance([ user[0].id ])
     .then( balance => {
       //If a balance record does not already exist for the user, we will create one
       if(!balance[0]) {
         let initialBalance = Math.floor((Math.random() + 1) * 100);
         db.create_initial_balance([initialBalance, user[0].id])
         .then( createdBalance => {
           if(createdBalance){
             return done( null, { id: user[0].id } );
           }
         })
       }
       else {
         return done( null, { id: user[0].id } );
       }
     })


   } else {

     db.create_user([profile.displayName, profile.emails[0].value, profile.picture, profile.identities[0].user_id])
     .then( user => {
       //Since we know no user existed, we won't check for a balance and instead just create one
       let initialBalance = Math.floor((Math.random() + 1) * 100);
       db.create_initial_balance([initialBalance, user[0].id])
       .then( createdBalance => {
         if(createdBalance){
           return done( null, { id: user[0].id } );
         }
       })
     })

   }
  })


}));

app.get('/auth', passport.authenticate('auth0'));

app.get('/auth/callback', passport.authenticate('auth0', {
  successRedirect: 'http://localhost:3005/#/private',
  failureRedirect: 'http://localhost:3005/#/'
}))

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  app.get('db').find_session_user([user.id])
  .then( user => {
    //Once we get back our user we will grab the balance associated with the account and pass it back to the frontend
    //we must also set a variable called db so we have access to it
    var db = app.get('db');
    db.find_balance([user[0].id])
    .then(balance => {
      if(balance) {
        user[0].balance = balance[0].balance;
        return done(null, user[0]);
      }
    })
  })
});

app.get('/auth/me', (req, res, next) => {
  // console.log('auth/me', req.user)
  if (!req.user) {
    return res.status(401).send('Log in required');
  } else {
    return res.status(200).send(req.user);
  }
})

app.get('/auth/logout', (req, res) => {
  req.logOut();
  return res.redirect('http://localhost:3005/#/');
})
//This is where we set up the route that will handle the deposit and withdrawel
app.post('/user/balance', (req, res) => {
  //we want to handle checking the balance on the server because the front end can be manipulated whereas the database won't lie to us.
  //....hopefully
  var db = app.get('db');
  switch(req.query.Action) {
    case 'deposit':
    let balanceToUpdate = Number(req.query.currentAmount) + Number(req.query.amount);
    db.deposit_100([balanceToUpdate, req.query.userId])
    .then(updatedBalance => {
      res.status(200).send(updatedBalance);
    })
    break;
    case 'withdraw':
    db.check_balance([req.query.userId])
    .then(balance => {
      //We will check if the current balance is greater than or equal to 100. If it is not we will tell the client that there is not enough to withdraw 100
      let currentBalance = balance[0].balance
      let balanceToUpdate = Number(req.query.currentAmount) - Number(req.query.amount);
      if(currentBalance >= 100) {
        db.withdraw_100([balanceToUpdate, req.query.userId])
        .then(updatedBalance => {
          res.status(200).send(updatedBalance)
        })
      } else {
        res.status(200).send('Balance is too low');
      }
    })
    break;
    default:
    res.status(200).send('No Action Submitted');
    break;
  }
})

let PORT = 3005;
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
})
