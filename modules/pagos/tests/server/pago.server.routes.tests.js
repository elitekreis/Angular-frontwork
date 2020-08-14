'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Pago = mongoose.model('Pago'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  pago;

/**
 * Pago routes tests
 */
describe('Pago CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Pago
    user.save(function () {
      pago = {
        name: 'Pago name'
      };

      done();
    });
  });

  it('should be able to save a Pago if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Pago
        agent.post('/api/pagos')
          .send(pago)
          .expect(200)
          .end(function (pagoSaveErr, pagoSaveRes) {
            // Handle Pago save error
            if (pagoSaveErr) {
              return done(pagoSaveErr);
            }

            // Get a list of Pagos
            agent.get('/api/pagos')
              .end(function (pagosGetErr, pagosGetRes) {
                // Handle Pagos save error
                if (pagosGetErr) {
                  return done(pagosGetErr);
                }

                // Get Pagos list
                var pagos = pagosGetRes.body;

                // Set assertions
                (pagos[0].user._id).should.equal(userId);
                (pagos[0].name).should.match('Pago name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Pago if not logged in', function (done) {
    agent.post('/api/pagos')
      .send(pago)
      .expect(403)
      .end(function (pagoSaveErr, pagoSaveRes) {
        // Call the assertion callback
        done(pagoSaveErr);
      });
  });

  it('should not be able to save an Pago if no name is provided', function (done) {
    // Invalidate name field
    pago.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Pago
        agent.post('/api/pagos')
          .send(pago)
          .expect(400)
          .end(function (pagoSaveErr, pagoSaveRes) {
            // Set message assertion
            (pagoSaveRes.body.message).should.match('Please fill Pago name');

            // Handle Pago save error
            done(pagoSaveErr);
          });
      });
  });

  it('should be able to update an Pago if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Pago
        agent.post('/api/pagos')
          .send(pago)
          .expect(200)
          .end(function (pagoSaveErr, pagoSaveRes) {
            // Handle Pago save error
            if (pagoSaveErr) {
              return done(pagoSaveErr);
            }

            // Update Pago name
            pago.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Pago
            agent.put('/api/pagos/' + pagoSaveRes.body._id)
              .send(pago)
              .expect(200)
              .end(function (pagoUpdateErr, pagoUpdateRes) {
                // Handle Pago update error
                if (pagoUpdateErr) {
                  return done(pagoUpdateErr);
                }

                // Set assertions
                (pagoUpdateRes.body._id).should.equal(pagoSaveRes.body._id);
                (pagoUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Pagos if not signed in', function (done) {
    // Create new Pago model instance
    var pagoObj = new Pago(pago);

    // Save the pago
    pagoObj.save(function () {
      // Request Pagos
      request(app).get('/api/pagos')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Pago if not signed in', function (done) {
    // Create new Pago model instance
    var pagoObj = new Pago(pago);

    // Save the Pago
    pagoObj.save(function () {
      request(app).get('/api/pagos/' + pagoObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', pago.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Pago with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/pagos/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Pago is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Pago which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Pago
    request(app).get('/api/pagos/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Pago with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Pago if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Pago
        agent.post('/api/pagos')
          .send(pago)
          .expect(200)
          .end(function (pagoSaveErr, pagoSaveRes) {
            // Handle Pago save error
            if (pagoSaveErr) {
              return done(pagoSaveErr);
            }

            // Delete an existing Pago
            agent.delete('/api/pagos/' + pagoSaveRes.body._id)
              .send(pago)
              .expect(200)
              .end(function (pagoDeleteErr, pagoDeleteRes) {
                // Handle pago error error
                if (pagoDeleteErr) {
                  return done(pagoDeleteErr);
                }

                // Set assertions
                (pagoDeleteRes.body._id).should.equal(pagoSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Pago if not signed in', function (done) {
    // Set Pago user
    pago.user = user;

    // Create new Pago model instance
    var pagoObj = new Pago(pago);

    // Save the Pago
    pagoObj.save(function () {
      // Try deleting Pago
      request(app).delete('/api/pagos/' + pagoObj._id)
        .expect(403)
        .end(function (pagoDeleteErr, pagoDeleteRes) {
          // Set message assertion
          (pagoDeleteRes.body.message).should.match('User is not authorized');

          // Handle Pago error error
          done(pagoDeleteErr);
        });

    });
  });

  it('should be able to get a single Pago that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Pago
          agent.post('/api/pagos')
            .send(pago)
            .expect(200)
            .end(function (pagoSaveErr, pagoSaveRes) {
              // Handle Pago save error
              if (pagoSaveErr) {
                return done(pagoSaveErr);
              }

              // Set assertions on new Pago
              (pagoSaveRes.body.name).should.equal(pago.name);
              should.exist(pagoSaveRes.body.user);
              should.equal(pagoSaveRes.body.user._id, orphanId);

              // force the Pago to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Pago
                    agent.get('/api/pagos/' + pagoSaveRes.body._id)
                      .expect(200)
                      .end(function (pagoInfoErr, pagoInfoRes) {
                        // Handle Pago error
                        if (pagoInfoErr) {
                          return done(pagoInfoErr);
                        }

                        // Set assertions
                        (pagoInfoRes.body._id).should.equal(pagoSaveRes.body._id);
                        (pagoInfoRes.body.name).should.equal(pago.name);
                        should.equal(pagoInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Pago.remove().exec(done);
    });
  });
});
