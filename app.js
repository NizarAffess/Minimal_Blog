const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Blog = require('./models/blog');

// express app
const app = express();

// Connect to mongodb
const dbURI = 'mongodb+srv://Ramiz:Ramroum159@blogcluster.jnmjm.mongodb.net/blog-base?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("listeneing for requests"))
  .catch(err => console.log(err));

//register view engine
app.set('view engine', 'ejs');

app.listen(3000);
// listen for requests

// middleware and static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true})); //middleware to parse the form data
app.use(morgan('dev'));
// app.use((req, res, next) => {
//   res.locals.path = req.path;
//   next();
// });


// routes
// Home page
app.get('/', (req, res) => {
  res.redirect('/blogs');
});

app.get('/about', (req, res) => {
  res.render('about', {title: 'About' });
});

// blog routes
app.get('/blogs', (req, res) => {
  Blog.find().sort({ createdAt: -1 })
  .then((result) => {
    res.render('index', { title: 'All Blogs', blogs: result });
  })
  .catch((err) => {
    console.log(err);
  })
});

// Post request
app.post('/blogs', (req, res) => {
  const blog = new Blog(req.body);
  blog.save()
  .then(result => {
    res.redirect('/blogs');
  })
  .catch(err => {
    console.log(err);
  })
});

app.get('/blogs/create', (req, res) => {
  res.render('create', {title: 'Create' });
});

app.get('/blogs/:id', (req, res) => {
  const id = req.params.id; // thanks to mongoose
  Blog.findById(id)
    .then(result => {
      res.render('details', { title: 'Blog details', blog: result })
    })
    .catch(err => {
      console.log(err);
    })
});

app.delete('/blogs/:id', (req, res) => {
  const id = req.params.id;

  Blog.findByIdAndDelete(id)
  // when we use an AJAX request (like the fetch API) in Node.js we can't use redirect. We have to send some json or data back to the browser.
  // in our case we're going to send some json data and that json data si going to have a redirect property
    .then(result => {
      res.json({ redirect: '/blogs' }); // this will redirect to the blogs page
    }) //When fetch is done in details.ejs and the response is sent to us. Then we get that json back to fetch().then('here'). And we get that json as json which we can't readily use. so we need to get that json data and put it inside fetch().then('here') in which we use another method response.json() and what this does, it returns another promise whereby it parses this json data into ana actual javascript object that we can use. So we can tack on another then method (right after fetch().then()) where we get access to that actual javascript object which we'll call 'data'.
    .catch(err =>  {
      console.log(err);
    })
});

// 404
app.use((req, res) => {
  res.status(404).render('404', {title: '404' });
});
