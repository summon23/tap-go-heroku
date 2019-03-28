'use strict';
const ENDPOINT = '/login';
const METHODTYPE = 'POST';

const UserRepo = require('../../repositories/user');
const feedRepo = require('../../repositories/userfeed');
const Promise = require('bluebird');
const { createJWTToken }  = require('../../auth/index');
const randtoken = require('rand-token');
const Auth = require('../../auth');
const config = require('../../config');
const bcrypt = require('bcryptjs');

// Load Env File
// config.loadEnvironment();

const ERROR_CODE = process.env.ERROR_CODE;
const SUCCESS_CODE = process.env.SUCCESS_CODE;

const MAINFUNCTION = Promise.coroutine(function* (req, responseHandler) {
    let statLogin = false;
    const { username, 
            password } = req.body;
    //yield feedRepo.createOne({'test':'data from local'});
    //const data =  yield feedRepo.findAll();
    //console.log(data);
    const checkUsername = yield UserRepo.findOne({
        username
    });

    if (!checkUsername) return responseHandler.NotFound('Username Not Found');
    if (bcrypt.compareSync(password, checkUsername.dataValues.password)){
        statLogin = true;
    }
    
    if(statLogin) {
        const refreshToken = randtoken.uid(50);
        const token = createJWTToken({
            sessionData: checkUsername.dataValues,
            maxAge: 7200
        });
        Auth.pushRefreshToken(token, refreshToken);
        return responseHandler.response({
                token: token,
                refresh_token: refreshToken,
                message: 'Load Success',
                error_code: SUCCESS_CODE
            }
        );
    } else {
        return responseHandler.NotFound('Invalid Username and Password');
    }
});

const MIDDLEWARE = (req, res, next) => {
    next();
};

module.exports = {
    ENDPOINT,
    METHODTYPE,
    MAINFUNCTION,
    MIDDLEWARE
};
