'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User');

/**
 * Get stock by User id
 */
exports.getStockByUserId = function(id, product, callback) {
	User.findById(id).exec(function(err, user){
        if (err)
            return callback(err);
        if(product.stocks != null){
            for(var i=0; i<product.stocks.length; i++){
                if('centroDeCosto' in user){
                    console.log('centro de costo', user.centroDeCosto)
                    if(product.stocks[i].costCenter === user.centroDeCosto) {
                        callback(null, i);
                        return;
                    }    
                }
            }
        }
        callback(null, null);
    });
};