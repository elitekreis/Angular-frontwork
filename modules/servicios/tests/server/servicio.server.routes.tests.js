'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Servicio = mongoose.model('Servicio'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  servicio;

/**
 * Servicio routes tests
 */
describe('Servicio CRUD tests', function () {

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

    // Save a user to the test db and create new Servicio
    user.save(function () {
      servicio = {
        name: 'Servicio name'
      };

      done();
    });
  });

  it('should be able to save a Servicio if logged in', function (done) {
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

        // Save a new Servicio
        agent.post('/api/servicios')
          .send(servicio)
          .expect(200)
          .end(function (servicioSaveErr, servicioSaveRes) {
            // Handle Servicio save error
            if (servicioSaveErr) {
              return done(servicioSaveErr);
            }

            // Get a list of Servicios
            agent.get('/api/servicios')
              .end(function (serviciosGetErr, serviciosGetRes) {
                // Handle Servicios save error
                if (serviciosGetErr) {
                  return done(serviciosGetErr);
                }

                // Get Servicios list
                var servicios = serviciosGetRes.body;

                // Set assertions
                (servicios[0].user._id).should.equal(userId);
                (servicios[0].name).should.match('Servicio name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Servicio if not logged in', function (done) {
    agent.post('/api/servicios')
      .send(servicio)
      .expect(403)
      .end(function (servicioSaveErr, servicioSaveRes) {
        // Call the assertion callback
        done(servicioSaveErr);
      });
  });

  it('should not be able to save an Servicio if no name is provided', function (done) {
    // Invalidate name field
    servicio.name = '';

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

        // Save a new Servicio
        agent.post('/api/servicios')
          .send(servicio)
          .expect(400)
          .end(function (servicioSaveErr, servicioSaveRes) {
            // Set message assertion
            (servicioSaveRes.body.message).should.match('Please fill Servicio name');

            // Handle Servicio save error
            done(servicioSaveErr);
          });
      });
  });

  it('should be able to update an Servicio if signed in', function (done) {
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

        // Save a new Servicio
        agent.post('/api/servicios')
          .send(servicio)
          .expect(200)
          .end(function (servicioSaveErr, servicioSaveRes) {
            // Handle Servicio save error
            if (servicioSaveErr) {
              return done(servicioSaveErr);
            }

            // Update Servicio name
            servicio.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Servicio
            agent.put('/api/servicios/' + servicioSaveRes.body._id)
              .send(servicio)
              .expect(200)
              .end(function (servicioUpdateErr, servicioUpdateRes) {
                // Handle Servicio update error
                if (servicioUpdateErr) {
                  return done(servicioUpdateErr);
                }

                // Set assertions
                (servicioUpdateRes.body._id).should.equal(servicioSaveRes.body._id);
                (servicioUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Servicios if not signed in', function (done) {
    // Create new Servicio model instance
    var servicioObj = new Servicio(servicio);

    // Save the servicio
    servicioObj.save(function () {
      // Request Servicios
      request(app).get('/api/servicios')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Servicio if not signed in', function (done) {
    // Create new Servicio model instance
    var servicioObj = new Servicio(servicio);

    // Save the Servicio
    servicioObj.save(function () {
      request(app).get('/api/servicios/' + servicioObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', servicio.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Servicio with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/servicios/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Servicio is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Servicio which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Servicio
    request(app).get('/api/servicios/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Servicio with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Servicio if signed in', function (done) {
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

        // Save a new Servicio
        agent.post('/api/servicios')
          .send(servicio)
          .expect(200)
          .end(function (servicioSaveErr, servicioSaveRes) {
            // Handle Servicio save error
            if (servicioSaveErr) {
              return done(servicioSaveErr);
            }

            // Delete an existing Servicio
            agent.delete('/api/servicios/' + servicioSaveRes.body._id)
              .send(servicio)
              .expect(200)
              .end(function (servicioDeleteErr, servicioDeleteRes) {
                // Handle servicio error error
                if (servicioDeleteErr) {
                  return done(servicioDeleteErr);
                }

                // Set assertions
                (servicioDeleteRes.body._id).should.equal(servicioSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Servicio if not signed in', function (done) {
    // Set Servicio user
    servicio.user = user;

    // Create new Servicio model instance
    var servicioObj = new Servicio(servicio);

    // Save the Servicio
    servicioObj.save(function () {
      // Try deleting Servicio
      request(app).delete('/api/servicios/' + servicioObj._id)
        .expect(403)
        .end(function (servicioDeleteErr, servicioDeleteRes) {
          // Set message assertion
          (servicioDeleteRes.body.message).should.match('User is not authorized');

          // Handle Servicio error error
          done(servicioDeleteErr);
        });

    });
  });

  it('should be able to get a single Servicio that has an orphaned user reference', function (done) {
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

          // Save a new Servicio
          agent.post('/api/servicios')
            .send(servicio)
            .expect(200)
            .end(function (servicioSaveErr, servicioSaveRes) {
              // Handle Servicio save error
              if (servicioSaveErr) {
                return done(servicioSaveErr);
              }

              // Set assertions on new Servicio
              (servicioSaveRes.body.name).should.equal(servicio.name);
              should.exist(servicioSaveRes.body.user);
              should.equal(servicioSaveRes.body.user._id, orphanId);

              // force the Servicio to have an orphaned user reference
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

                    // Get the Servicio
                    agent.get('/api/servicios/' + servicioSaveRes.body._id)
                      .expect(200)
                      .end(function (servicioInfoErr, servicioInfoRes) {
                        // Handle Servicio error
                        if (servicioInfoErr) {
                          return done(servicioInfoErr);
                        }

                        // Set assertions
                        (servicioInfoRes.body._id).should.equal(servicioSaveRes.body._id);
                        (servicioInfoRes.body.name).should.equal(servicio.name);
                        should.equal(servicioInfoRes.body.user, undefined);

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
      Servicio.remove().exec(done);
    });
  });
});
