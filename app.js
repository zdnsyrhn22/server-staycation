var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
//import mongoose
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://zsyrhn22:sandalz123@cluster0.j0yuf.mongodb.net/db_staycation?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
// mongoose.connect('mongodb://localhost:27017/db_staycation');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
//router admin
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');

var app = express();
var cors = require('cors')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(methodOverride('_method'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/mazer',express.static(path.join(__dirname, '/public/vendors/mazer/dist')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));
app.use(flash());
app.use('/', indexRouter);
app.use('/users', usersRouter);
//admin
app.use(cors())
app.use('/admin', adminRouter);
app.use('/api/v1/member', apiRouter);

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
