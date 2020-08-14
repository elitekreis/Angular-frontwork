'use strict';

var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    Enterprise = mongoose.model('Enterprise'),
    ObjectId = mongoose.Types.ObjectId,
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Create the chat configuration
module.exports = function(io, socket) {

    //get enterprises and create socket namespaces
    getEnterprises(function(result){
        if(result.status !== 'success') {
            console.log('Error al recibir listado de empresas para el socket: ', result.message);
        } else {
            //console.log('data: ', JSON.stringify(result.data));
            if (result.data.length > 0) {
                var enterprises = result.data;
                var namespaces = {};

                enterprises.forEach(function(enterprise){
                    namespaces[enterprise.name] = io.of('/' + enterprise.name); 
                });

                //console.log('namespace:', namespaces);
            } else {
                console.log('Error, no se han creado empresas?');
            }
        }
    });

    

    // get list of posts for enterpise when message is received
    socket.on('getPosts', function() {
        // save post to db
        getPosts(function(result){
            if(result.status !== 'success') {
                console.log('Error al escribir en db: ', result.message);
            } else {
                io.emit('PostList', result.data);
            }
        });
        // Emit the 'chatMessage' event
        
    });

    // Send a chat messages to all connected sockets when a message is received 
    socket.on('createPost', function(message) {
        message.type = 'message';
        message.created = Date.now();
        message.enterprise = socket.request.user ? socket.request.user.enterprise._id : '';
        message.user = socket.request.user;

        // save post to db
        createPost(message, function(result){
            if(result.status !== 'success') {
                console.log('Error al escribir en db: ', data.message);
            } else {
                message._id = result.data._id;
                io.emit('newPost', message);
            }
        });
        // Emit the 'chatMessage' event
        
    });

    socket.on('createComment', function(message) {
        message.type = 'message';
        message.created = Date.now();
        message.user = socket.request.user;

        // save post to db
        createComment(message, function(result){
            if(result.status !== 'success') {
                console.log('Error al escribir en db: ', result.message);
            } else {
                io.emit('newComment', result.data);
            }
        });

        // Emit the 'chatMessage' event
        
    });

    // Emit the status event when a socket client is disconnected
    socket.on('disconnect', function() {
        io.emit('chatMessage', {
            type: 'status',
            text: 'disconnected',
            created: Date.now(),
            username: socket.request.user.username
        });
    });


    function createPost(message, callback) {
        var post = new Post(message);

        post.save(function(err) {
            if (err) {
                return callback({status: 'error', message: errorHandler.getErrorMessage(err)});
            } else {
                callback({status: 'success', data: post});
            }
        });
    };

    function createComment(message, callback) {
        var postId = message.postId;

        var comment = message;
        var commentId = new ObjectId();

        comment = {_id: commentId, user: message.user, created: message.created, message: comment.message};

        Post.findById(postId)
        .exec(function(err, post) {
            if (err) {
                return callback({status: 'error', message: errorHandler.getErrorMessage(err)});
            } else {
                post.comments.push(comment);

                post.save(function(err) {
                    if (err) {
                        return callback({status: 'error', message: errorHandler.getErrorMessage(err)});
                    } else {
                        comment.postId = postId;
                        callback({status: 'success', data: message});
                    }
                });
                //res.jsonp(post);
            }
        });
    };

    function getPosts(callback) {
        var enterprise = socket.request.user.enterprise._id;
        if (enterprise !== undefined) {
            Post.find({enterprise: enterprise})
            .sort('-created')
            .populate('user')
            .exec(function(err, posts) {
                if (err) {
                    callback({status: 'error', message: errorHandler.getErrorMessage(err)});
                } else {
                    callback({status: 'success', data: posts});
                }
            });
        } else {
            Post.find()
            .sort('-created')
            .populate('user')
            .exec(function(err, posts) {
                if (err) {
                    callback({status: 'error', message: errorHandler.getErrorMessage(err)});
                } else {
                    callback({status: 'success', data: posts});
                }
            });
        };
        
    };

    function getEnterprises(callback) {
        Enterprise.find()
            .sort('-created')
            .exec(function(err, enterprises) {
                if (err) {
                    callback({status: 'error', message: errorHandler.getErrorMessage(err)});
                } else {
                    callback({status: 'success', data: enterprises});
                }
            });
    }
};
