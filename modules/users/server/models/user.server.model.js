'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: ''
	},
	lastName: {
		type: String,
		trim: true,
		default: ''
	},
	displayName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: '',
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	cuit: {
		type: String,
		trim: true,
		defailt: ''
	},
	telefono: {
		type: String,
		trim: true,
		default: ''
	},
	username: {
		type: String,
		unique: 'testing error message',
		trim: true
	},
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	storeName: {
		type: String
	},
	profileImageURL: {
		type: String,
		default: 'modules/users/img/profile/default.png'
	},
	enterprise: {
		type: String,
		ref: 'Enterprise'
	},
    centroDeCosto: {
        type: String,
        ref: 'Costcenter'
    },
	puesto: {
		type: String,
		ref: 'Puesto'
	},
	fechaDeEntrada: {
		type: Date
	},
    remuneraciones: [{
        _id: {
        	type: String
		},
		name: {
            type: String
		},
		unit: {
            type: String
		},
		total: {
        	type: Number,
			default: 0
		}
    }],
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	status: {
		type: String,
		enum: [ 'active', 'pending', 'disabled', 'deleted'],
		default: 'pending'
	},
	roles: {
		type: [{
			type: String,
			enum: ['guest','user', 'admin', 'groso', 'rrhh', 'compras', 'ventas', 'produccion', 'cliente']
		}]
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	deleted:{
		type: Boolean,
		default: false
	},
	observaciones:{
		type: String
	},
	padre: {
		type: String,
		ref: 'User'
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
  	resetPasswordExpires: {
  		type: Date
  	}
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
	if (this.password && this.password.length > 6) {
		if(this.password.length == 88) {
			next();
		} else {
			this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
			this.password = this.hashPassword(this.password);
			next();
		};

	}

});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
	// return this.password === password;
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

mongoose.model('User', UserSchema);
