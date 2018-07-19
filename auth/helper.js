const jwt = require('jsonwebtoken');

exports.verifyJWTToken = function verifyJWTToken (token){
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err || !decodedToken) {
                return reject(err);
            }

            resolve(decodedToken);
        })
    })
};

module.exports = exports;
