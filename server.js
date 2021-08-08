if(process.env.NODE_ENV !== 'production'){
   require('dotenv').config()
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt'); 
const passport = require('passport');
/* Passport is authentication middleware for Node.js
can be used w / username and password, Facebook, Twitter
*/

// this is what is needed to create the app.delete function
// (which allows a user to log out)
const methodOverride = require('method-override');

// 2 libraries that were installed previously
const flash = require('express-flash')
const session = require ('express-session')

const initializePassport = require('./passport-config')

initializePassport(
   passport, 
   email => users.find(user => user.email === email),
   id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false})); // built-in middleware function
app.use(flash())
app.use(session({
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: false 
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method')); // enables app.delete() to work

// set up route to home page
// if they are authenticated redirect to 
app.get('/', checkAuthenticated, (req, res) => {
   res.render('index.ejs', { name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => { 
   res.render('login.ejs') 
})
 
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
   successRedirect: '/', // go to home page
   failureRedirect: '/login',
   failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
   res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
   try {
      
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const user = 
      {
         id: Date.now.toString(),
         name: req.body.name,
         email: req.body.email,
         password: hashedPassword
      }
      users.push(user);
      res.redirect('/login') // now they can login w/ new account
   
   }catch{
      res.redirect('/register') // something went wrong, try again
   }
   console.log ('account created')
   console.log (users)
})

app.delete('/logout', (req, res) => {
   req.logOut(); // provided by passport
   res.redirect('/login')
})

/* middleware to prevent home page from loading when no one 
is logged in
*/
function checkAuthenticated(req, res, next) {
   if(req.isAuthenticated()) {
      return next()
   }

   res.redirect('/login')  
}

function checkNotAuthenticated(req, res, next){
   if(req.isAuthenticated()) {
      return res.redirect('/')
   }
   next()
}

app.listen(3000); 