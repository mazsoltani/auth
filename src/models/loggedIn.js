const mongoose = require('mongoose');
const config = require('../../config/config.json');

mongoose.connect(config.dbURL);

const LoggedInSchema = mongoose.Schema({
    token: {
        type: String
        ,required: true
        ,unique: true
    }
});

const LoggedIn = module.exports = mongoose.model('LoggedIn', LoggedInSchema);

module.exports.createLoggedIn = (newLoggedIn, callback) => {
    newLoggedIn.save(callback);
};

module.exports.getRecordByToken = (token, callback) => {
    const query = { token };
    LoggedIn.findOne(query, callback);
};

module.exports.removeRecordByToken = (token, callback) => {
    const query = { token };
    LoggedIn.remove(query, callback);
}