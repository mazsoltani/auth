const mongoose = require('mongoose');
const config = require('../../config/config');

const LoggedInSchema = mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
});

const LoggedIn = module.exports = mongoose.model('LoggedIn', LoggedInSchema);

module.exports.createLoggedIn = (newLoggedIn, callback) => {
    newLoggedIn.save(callback);
};

module.exports.getRecordByToken = (token) => {
    const query = {
        token
    };
    return LoggedIn.findOne(query);
};

module.exports.removeRecordByToken = (token, callback) => {
    const query = {
        token
    };
    LoggedIn.deleteOne(query, callback);
};