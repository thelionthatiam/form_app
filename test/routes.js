const chai = require('chai');
const expect = require("chai").expect;
const should = require("chai").should();
const app = require('../app');
const request = require('supertest');
const session = require('supertest-session');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var testSession = null;

beforeEach(function() {
  testSession = session(app);
});

// describe('Session test TEST', function() {
//   it('should fail accessing a resticted page', function(done) {
//     testSession.get('/in-session/to-change-email')
//       .expect(200)
//       .end((err, res) => {
//         var document = res.res.text;
//         expect(res.statusCode).to.equal(200);
//         expect(document).to.match(/login/);
//         done();
//       })
//   })
//
//   it('should access page', function(done) {
//     testSession.get('/in-session/to-change-email')
//       .send({
//         'email': 'test@mailinator.com',
//         'password': '$2a$10$lt288mCKOoj7bo0w0jpujOvx.M5iJ.o.PvynckvrRC6mXKe7uxgne',
//         'phone': '12341234'
//       })
//       .expect(200)
//       .end((err, res) => {
//         var document = res.res.text;
//         expect(res.statusCode).to.equal(200);
//         expect(document).to.match(/test@mailinator.com/);
//         done();
//       })
//   })
// })

describe('This index route', function(){
  it('renders the homepage', function(done) {
    request(app)
    .get('/')
    .end((err, res) => {
      var document = res.res.text;
      expect(res.statusCode).to.equal(200);
      expect(document).to.match(/Put all your cares aside!/);
      done();
    })
  })
})

describe('This account route', function(){
  it('renders account creation page', function(done) {

    request(app)
    .post('/account/create')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/user info/);
      done();
    })
  })
  it('creates a new account', function(done) {

    request(app)
    .post('/account/create')
    .type('form')
    .send({
      'email': 'test@mailinator.com',
      'phone': '12341234',
      'password': 'nnnNN11$$'
    })
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/success/);
      done();
    })
  })
  it('renders an account deletion page', function(done) {

    request(app)
    .post('/account/delete')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/delete account/);
      done();
    })
  })
})

describe('This authorizing route', function(){
  it('logs into an existing account', function(done) {

    request(app)
    .post('/auth/login')
    .type('form')
    .send({
      'email': 'test@mailinator.com',
      'password': 'nnnNN11$$'
    })
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/test@mailinator.com/);
      done();
    })
  })
})

describe('This account management route', function() {

  var authenticatedSession;
  beforeEach(function(done) {

    testSession.post('/auth/login')
    .type('form')
    .send({
      'email': 'test@mailinator.com',
      'password': 'nnnNN11$$'
    })
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/test@mailinator.com/);
      authenticatedSession = testSession;
      return done();
    })
  })

  it('renders the account change page', function(done) {
    authenticatedSession.get('/in-session/to-manage-account')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/click change if you need to fix something/);
      done();
    })
  })

  it('renders change email page', function(done) {
    authenticatedSession.get('/in-session/to-change-email')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/type in a new email/);
      done();
    })
  })

  it('allows user to change email', function(done) {
    authenticatedSession.post('/in-session/change-email')
    .type('form')
    .send({
      'email': 'test@mailinator.com'
    })
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/email updated/);
      done();
    })
  })

  it('renders change phone page', function(done) {
    authenticatedSession.get('/in-session/to-change-phone')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/type in a new phone/);
      done();
    })
  })

  it('allows user to change phone', function(done) {
    authenticatedSession.post('/in-session/change-phone')
    .type('form')
    .send({
      'phone': '12341234',
    })
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/updated/);
      done();
    })
  })

  it('sends mail to the account on file', function(done) {
    authenticatedSession.post('/auth/mailer')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      expect(document).to.match(/check your email and follow the link/);
      done();
    })
  })

  describe('This authorizing route', function () {

    var reAuthenticatedSession;
    beforeEach(function(done) {
      authenticatedSession.post('/auth/mailer')
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        var document = res.res.text;
        reAuthenticatedSession = authenticatedSession;
        expect(document).to.match(/check your email and follow the link/);
        done();
      })
    })


    it('confirms token', function(done) {
      this.timeout(5000);
      reAuthenticatedSession.get('/auth/new-password')
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        var document = res.res.text;
        // console.log('NEW PASSWORD PAGE', document);
        expect(document).to.match(/password reset/);
        done();
      })
    })
  })

  it('allows user to change password', function(done){
    authenticatedSession.post('/auth/change-password')
    .type('form')
    .send({
      'password': 'tttTT11$$',
    })
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/password updated/);
      done();
    })
  })
})

describe('This authorizing route', function() {
  it('logs out of an existing account', function(done) {

    request(app)
    .post('/auth/log-out')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/Welcome back!/);
      done();
    })
  })
  it('confirms the deletion of an account', function(done) {

    request(app)
    .post('/auth/delete')
    .type('form')
    .send({
      'email': 'test@mailinator.com',
      'password': 'nnnNN11$$'
    })
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      if(err) throw err;
      var document = res.res.text;
      // console.log(document);
      expect(document).to.match(/Welcome back! Your account was deleted, make a new one if you want to come back in/);
      done();
    })
  })
})
