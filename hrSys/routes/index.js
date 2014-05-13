var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* login page. */
router.get('/login', function(req, res) {
    res.render('index', { title: 'login' });
});
/* login page. */
router.post('/login', function(req, res) {
    res.render('index', { title: 'login' });
});

/* administration page. */
router.get('/admin', function(req, res) {
    res.render('index', { title: 'administration' });
});

/* administration page. */
router.post('/admin', function(req, res) {
    res.render('index', { title: 'administration' });
});

/* add/modify item page. */
router.get('/item', function(req, res) {
    res.render('index', { title: 'add/modify item' });
});

/* add/modify page. */
router.post('/item', function(req, res) {
    res.render('index', { title: 'add/modify' });
});

/* statistics page. */
router.get('/statistics', function(req, res) {
    res.render('index', { title: 'statistics' });
});

/* statistics page. */
router.post('/statistics', function(req, res) {
    res.render('index', { title: 'statistics' });
});

/* search page. */
router.get('/search', function(req, res) {
    res.render('index', { title: 'search' });
});

/* search page. */
router.post('/search', function(req, res) {
    res.render('index', { title: 'search' });
});

/* logout page. */
router.post('/logout', function(req, res) {
    res.render('index', { title: 'logout' });
});

module.exports = router;
