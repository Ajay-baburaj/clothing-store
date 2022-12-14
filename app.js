var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()
var hbs = require('express-handlebars');
var Handlebars = require('handlebars');
var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user');
var db = require('./config/connection')
var session = require('express-session')



  
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialDir:__dirname+'/views/partials/'}))

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('wishlistHeartIcon',function(productId,wishlistArray,options){
  if(wishlistArray){
    function doesAnyWishlistIdMatch(wishlistProducts){
    return productId.toString() == wishlistProducts.products.toString()
  }
  if(wishlistArray.some(doesAnyWishlistIdMatch)){
    return options.fn()
  }else{
    return options.inverse();   
}

  }else{
    return options.inverse();   
}


});



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"hello",resave:false,saveUninitialized:false}))


db.connect((err)=>{
  if(err)console.log("connection error")
  else console.log("database connected")
})

app.use((req,res,next)=>{
  res.set('cache-control','no-store')
  next()
})

app.use('/admin', adminRouter);
app.use('/', userRouter);


app.get('/*',(req,res)=>{
  res.render('404')
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
