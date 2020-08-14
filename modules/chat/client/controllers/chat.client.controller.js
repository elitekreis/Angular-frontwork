'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', 'Socket', 'Posts', 'lodash', 'Authentication',
    function($scope, Socket, Posts, lodash, Authentication) {

        $scope.authentication = Authentication;

        // watch for SEARCH to update value
        $scope.$watchCollection('authentication', function (){
            $scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
            //$scope.find();
            //console.log('search: ', $scope.SEARCH);
        });

        var _ = lodash;
    	// Create a messages array
        $scope.posts = [];
        
        Socket.on('PostList', function(message) {
            if(message.length > 0 && message[0].enterprise === $scope.SEARCH.enterprise) {
                $scope.posts= message;       
            }            
        });
        // Add an event listener to the 'chatMessage' event
        Socket.on('newPost', function(message) {
            //$scope.posts.unshift(message);
            // only add the post if we don't have it already in the posts list to avoid dupes
        if ($scope.SEARCH !== undefined) {
            if (message.enterprise === $scope.SEARCH.enterprise) {
                if (!_.some($scope.posts, function (p) {
                    return p._id === message._id;
                  })) {
                    $scope.posts.unshift(message);
                  }
            }
            
          };
          
        });

        Socket.on('newComment', function(message) {
            //$scope.posts.unshift(message);

            if ($scope.SEARCH !== undefined) {
                if (message.user.enterprise._id === $scope.SEARCH.enterprise) {
                    var post = _.find($scope.posts, function (post) {
                      return post._id === message.postId;
                    });

                    // only add the comment if we don't have it already in the post's comments list to avoid dupes
                    if (post && !_.some(post.comments, function (c) {
                      return c._id === message._id;
                    })) {
                      post.comments.push(message);
                    }
                }
            };
        });
        
        // Create a controller method for sending messages
        $scope.sendPost = function() {
        	// Create a new message object
            //this.messageText.disabled = true;
            var post = {
                message: this.messageText
            };
            
            // Emit a 'chatMessage' message event
            Socket.emit('createPost', post);
            
            // Clear the message text
            this.messageText = '';
        };

        $scope.sendComment = function($event, post) {
            if ($event.keyCode !== 13) {
              return;
            }
            // Create a new message object
            var comment = {
                postId: post._id,
                message: post.commentBox.message
            };
            
            // Emit a 'chatMessage' message event
            Socket.emit('createComment', comment);
            
            // Clear the message text
            this.post.commentBox.message = '';
        };

        $scope.findPosts = function() {
            //$scope.posts = Posts.query();
             Socket.emit('getPosts', null);
        };

        // Remove the event listener when the controller instance is destroyed
        $scope.$on('$destroy', function() {
            Socket.removeListener('chatMessage');
        });

    }
]); 