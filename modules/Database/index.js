'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const Sequelize = require('sequelize');
const mongodb = require('mongodb');
const modelPath = './model';
const Helper = require('../../utils/helper');
const config = require('../../config');

// Load Env File
// config.loadEnvironment();

const models = {};
let modelsInitialized = false;

exports.getContext = Promise.coroutine(function* getContext() {
    if (modelsInitialized === true) {
        return models;
    }

    const DB = new Sequelize(process.env.DB_CONNECTION_STRING, {
        dialect: 'mysql',
        logging: true,
        // logging: process.env.NODE_ENV === 'production' ? false : console.log,
        pool: {
            min: 0,
            max: 5,
            idle: 10000,
            evict: 10000,
        },
        operatorsAliases: false,
    });

    //migrate Database
    const file = fs.readdirSync(path.join(__dirname, '../../', modelPath)).filter((file) => {
        return (file.indexOf('.') !== 0) && (path.extname(file) === '.js') && (file !== 'index.js');
    }).forEach((file) => {
        const model = DB.import(path.join(__dirname, '../../' ,modelPath, file));
        //console.log(model);
        models[model.name] = model;
    });

    return models;
});

exports.getInstance = () => models;

exports.startTransaction = Promise.coroutine(function* startTransaction() {
    models.db_transaction = yield models.context.transaction({
        isolationLevel: models.context.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED
    });
});

exports.commit = Promise.coroutine(function* commit() {
    if (models.db_transaction) {
        yield models.db_transaction.commit();
        models.db_transaction = null;
    }
});

exports.rollback = Promise.coroutine(function* rollback() {
    if (models.db_transaction) {
        yield models.db_transaction.rollback();
        models.db_transaction = null;
    }
});

exports.closeContext = Promise.coroutine(function* closeContext() {
    if (models && models.context) {
        const result = yield models.context.close();
        models = {
            ORMProvider: Sequelize
        };
        modelsInitialized = false;
        return result;
    }

    return null;
});

module.exports = exports;
