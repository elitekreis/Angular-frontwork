'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Empleado = mongoose.model('Empleado'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, empleado;

/**
 * Empleado routes tests
 */
describe('Empleado CRUD tests', function () {

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

    // Save a user to the test db and create new Empleado
    user.save(function () {
      empleado = {
        name: 'Empleado name'
      };

      done();
    });
  });

  it('should be able to save a Empleado if logged in', function (done) {
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

        // Save a new Empleado
        agent.post('/api/empleados')
          .send(empleado)
          .expect(200)
          .end(function (empleadoSaveErr, empleadoSaveRes) {
            // Handle Empleado save error
            if (empleadoSaveErr) {
              return done(empleadoSaveErr);
            }

            // Get a list of Empleados
            agent.get('/api/empleados')
              .end(function (empleadosGetErr, empleadosGetRes) {
                // Handle Empleado save error
                if (empleadosGetErr) {
                  return done(empleadosGetErr);
                }

                // Get Empleados list
                var empleados = empleadosGetRes.body;

                // Set assertions
                (empleados[0].user._id).should.equal(userId);
                (empleados[0].name).should.match('Empleado name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Empleado if not logged in', function (done) {
    agent.post('/api/empleados')
      .send(empleado)
      .expect(403)
      .end(function (empleadoSaveErr, empleadoSaveRes) {
        // Call the assertion callback
        done(empleadoSaveErr);
      });
  });

  it('should not be able to save an Empleado if no name is provided', function (done) {
    // Invalidate name field
    empleado.name = '';

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

        // Save a new Empleado
        agent.post('/api/empleados')
          .send(empleado)
          .expect(400)
          .end(function (empleadoSaveErr, empleadoSaveRes) {
            // Set message assertion
            (empleadoSaveRes.body.message).should.match('Please fill Empleado name');

            // Handle Empleado save error
            done(empleadoSaveErr);
          });
      });
  });

  it('should be able to update an Empleado if signed in', function (done) {
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

        // Save a new Empleado
        agent.post('/api/empleados')
          .send(empleado)
          .expect(200)
          .end(function (empleadoSaveErr, empleadoSaveRes) {
            // Handle Empleado save error
            if (empleadoSaveErr) {
              return done(empleadoSaveErr);
            }

            // Update Empleado name
            empleado.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Empleado
            agent.put('/api/empleados/' + empleadoSaveRes.body._id)
              .send(empleado)
              .expect(200)
              .end(function (empleadoUpdateErr, empleadoUpdateRes) {
                // Handle Empleado update error
                if (empleadoUpdateErr) {
                  return done(empleadoUpdateErr);
                }

                // Set assertions
                (empleadoUpdateRes.body._id).should.equal(empleadoSaveRes.body._id);
                (empleadoUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Empleados if not signed in', function (done) {
    // Create new Empleado model instance
    var empleadoObj = new Empleado(empleado);

    // Save the empleado
    empleadoObj.save(function () {
      // Request Empleados
      request(app).get('/api/empleados')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Empleado if not signed in', function (done) {
    // Create new Empleado model instance
    var empleadoObj = new Empleado(empleado);

    // Save the Empleado
    empleadoObj.save(function () {
      request(app).get('/api/empleados/' + empleadoObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', empleado.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Empleado with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/empleados/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Empleado is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Empleado which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Empleado
    request(app).get('/api/empleados/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Empleado with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Empleado if signed in', function (done) {
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

        // Save a new Empleado
        agent.post('/api/empleados')
          .send(empleado)
          .expect(200)
          .end(function (empleadoSaveErr, empleadoSaveRes) {
            // Handle Empleado save error
            if (empleadoSaveErr) {
              return done(empleadoSaveErr);
            }

            // Delete an existing Empleado
            agent.delete('/api/empleados/' + empleadoSaveRes.body._id)
              .send(empleado)
              .expect(200)
              .end(function (empleadoDeleteErr, empleadoDeleteRes) {
                // Handle empleado error error
                if (empleadoDeleteErr) {
                  return done(empleadoDeleteErr);
                }

                // Set assertions
                (empleadoDeleteRes.body._id).should.equal(empleadoSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Empleado if not signed in', function (done) {
    // Set Empleado user
    empleado.user = user;

    // Create new Empleado model instance
    var empleadoObj = new Empleado(empleado);

    // Save the Empleado
    empleadoObj.save(function () {
      // Try deleting Empleado
      request(app).delete('/api/empleados/' + empleadoObj._id)
        .expect(403)
        .end(function (empleadoDeleteErr, empleadoDeleteRes) {
          // Set message assertion
          (empleadoDeleteRes.body.message).should.match('User is not authorized');

          // Handle Empleado error error
          done(empleadoDeleteErr);
        });

    });
  });

  it('should be able to get a single Empleado that has an orphaned user reference', function (done) {
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

          // Save a new Empleado
          agent.post('/api/empleados')
            .send(empleado)
            .expect(200)
            .end(function (empleadoSaveErr, empleadoSaveRes) {
              // Handle Empleado save error
              if (empleadoSaveErr) {
                return done(empleadoSaveErr);
              }

              // Set assertions on new Empleado
              (empleadoSaveRes.body.name).should.equal(empleado.name);
              should.exist(empleadoSaveRes.body.user);
              should.equal(empleadoSaveRes.body.user._id, orphanId);

              // force the Empleado to have an orphaned user reference
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

                    // Get the Empleado
                    agent.get('/api/empleados/' + empleadoSaveRes.body._id)
                      .expect(200)
                      .end(function (empleadoInfoErr, empleadoInfoRes) {
                        // Handle Empleado error
                        if (empleadoInfoErr) {
                          return done(empleadoInfoErr);
                        }

                        // Set assertions
                        (empleadoInfoRes.body._id).should.equal(empleadoSaveRes.body._id);
                        (empleadoInfoRes.body.name).should.equal(empleado.name);
                        should.equal(empleadoInfoRes.body.user, undefined);

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
      Empleado.remove().exec(done);
    });
  });
});
