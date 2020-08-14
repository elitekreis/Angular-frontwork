'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Costosindirecto = mongoose.model('Costosindirecto'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  costosindirecto;

/**
 * Costosindirecto routes tests
 */
describe('Costosindirecto CRUD tests', function () {

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

    // Save a user to the test db and create new Costosindirecto
    user.save(function () {
      costosindirecto = {
        name: 'Costosindirecto name'
      };

      done();
    });
  });

  it('should be able to save a Costosindirecto if logged in', function (done) {
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

        // Save a new Costosindirecto
        agent.post('/api/costosindirectos')
          .send(costosindirecto)
          .expect(200)
          .end(function (costosindirectoSaveErr, costosindirectoSaveRes) {
            // Handle Costosindirecto save error
            if (costosindirectoSaveErr) {
              return done(costosindirectoSaveErr);
            }

            // Get a list of Costosindirectos
            agent.get('/api/costosindirectos')
              .end(function (costosindirectosGetErr, costosindirectosGetRes) {
                // Handle Costosindirectos save error
                if (costosindirectosGetErr) {
                  return done(costosindirectosGetErr);
                }

                // Get Costosindirectos list
                var costosindirectos = costosindirectosGetRes.body;

                // Set assertions
                (costosindirectos[0].user._id).should.equal(userId);
                (costosindirectos[0].name).should.match('Costosindirecto name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Costosindirecto if not logged in', function (done) {
    agent.post('/api/costosindirectos')
      .send(costosindirecto)
      .expect(403)
      .end(function (costosindirectoSaveErr, costosindirectoSaveRes) {
        // Call the assertion callback
        done(costosindirectoSaveErr);
      });
  });

  it('should not be able to save an Costosindirecto if no name is provided', function (done) {
    // Invalidate name field
    costosindirecto.name = '';

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

        // Save a new Costosindirecto
        agent.post('/api/costosindirectos')
          .send(costosindirecto)
          .expect(400)
          .end(function (costosindirectoSaveErr, costosindirectoSaveRes) {
            // Set message assertion
            (costosindirectoSaveRes.body.message).should.match('Please fill Costosindirecto name');

            // Handle Costosindirecto save error
            done(costosindirectoSaveErr);
          });
      });
  });

  it('should be able to update an Costosindirecto if signed in', function (done) {
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

        // Save a new Costosindirecto
        agent.post('/api/costosindirectos')
          .send(costosindirecto)
          .expect(200)
          .end(function (costosindirectoSaveErr, costosindirectoSaveRes) {
            // Handle Costosindirecto save error
            if (costosindirectoSaveErr) {
              return done(costosindirectoSaveErr);
            }

            // Update Costosindirecto name
            costosindirecto.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Costosindirecto
            agent.put('/api/costosindirectos/' + costosindirectoSaveRes.body._id)
              .send(costosindirecto)
              .expect(200)
              .end(function (costosindirectoUpdateErr, costosindirectoUpdateRes) {
                // Handle Costosindirecto update error
                if (costosindirectoUpdateErr) {
                  return done(costosindirectoUpdateErr);
                }

                // Set assertions
                (costosindirectoUpdateRes.body._id).should.equal(costosindirectoSaveRes.body._id);
                (costosindirectoUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Costosindirectos if not signed in', function (done) {
    // Create new Costosindirecto model instance
    var costosindirectoObj = new Costosindirecto(costosindirecto);

    // Save the costosindirecto
    costosindirectoObj.save(function () {
      // Request Costosindirectos
      request(app).get('/api/costosindirectos')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Costosindirecto if not signed in', function (done) {
    // Create new Costosindirecto model instance
    var costosindirectoObj = new Costosindirecto(costosindirecto);

    // Save the Costosindirecto
    costosindirectoObj.save(function () {
      request(app).get('/api/costosindirectos/' + costosindirectoObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', costosindirecto.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Costosindirecto with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/costosindirectos/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Costosindirecto is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Costosindirecto which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Costosindirecto
    request(app).get('/api/costosindirectos/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Costosindirecto with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Costosindirecto if signed in', function (done) {
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

        // Save a new Costosindirecto
        agent.post('/api/costosindirectos')
          .send(costosindirecto)
          .expect(200)
          .end(function (costosindirectoSaveErr, costosindirectoSaveRes) {
            // Handle Costosindirecto save error
            if (costosindirectoSaveErr) {
              return done(costosindirectoSaveErr);
            }

            // Delete an existing Costosindirecto
            agent.delete('/api/costosindirectos/' + costosindirectoSaveRes.body._id)
              .send(costosindirecto)
              .expect(200)
              .end(function (costosindirectoDeleteErr, costosindirectoDeleteRes) {
                // Handle costosindirecto error error
                if (costosindirectoDeleteErr) {
                  return done(costosindirectoDeleteErr);
                }

                // Set assertions
                (costosindirectoDeleteRes.body._id).should.equal(costosindirectoSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Costosindirecto if not signed in', function (done) {
    // Set Costosindirecto user
    costosindirecto.user = user;

    // Create new Costosindirecto model instance
    var costosindirectoObj = new Costosindirecto(costosindirecto);

    // Save the Costosindirecto
    costosindirectoObj.save(function () {
      // Try deleting Costosindirecto
      request(app).delete('/api/costosindirectos/' + costosindirectoObj._id)
        .expect(403)
        .end(function (costosindirectoDeleteErr, costosindirectoDeleteRes) {
          // Set message assertion
          (costosindirectoDeleteRes.body.message).should.match('User is not authorized');

          // Handle Costosindirecto error error
          done(costosindirectoDeleteErr);
        });

    });
  });

  it('should be able to get a single Costosindirecto that has an orphaned user reference', function (done) {
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

          // Save a new Costosindirecto
          agent.post('/api/costosindirectos')
            .send(costosindirecto)
            .expect(200)
            .end(function (costosindirectoSaveErr, costosindirectoSaveRes) {
              // Handle Costosindirecto save error
              if (costosindirectoSaveErr) {
                return done(costosindirectoSaveErr);
              }

              // Set assertions on new Costosindirecto
              (costosindirectoSaveRes.body.name).should.equal(costosindirecto.name);
              should.exist(costosindirectoSaveRes.body.user);
              should.equal(costosindirectoSaveRes.body.user._id, orphanId);

              // force the Costosindirecto to have an orphaned user reference
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

                    // Get the Costosindirecto
                    agent.get('/api/costosindirectos/' + costosindirectoSaveRes.body._id)
                      .expect(200)
                      .end(function (costosindirectoInfoErr, costosindirectoInfoRes) {
                        // Handle Costosindirecto error
                        if (costosindirectoInfoErr) {
                          return done(costosindirectoInfoErr);
                        }

                        // Set assertions
                        (costosindirectoInfoRes.body._id).should.equal(costosindirectoSaveRes.body._id);
                        (costosindirectoInfoRes.body.name).should.equal(costosindirecto.name);
                        should.equal(costosindirectoInfoRes.body.user, undefined);

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
      Costosindirecto.remove().exec(done);
    });
  });
});
