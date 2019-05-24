const mongoose = require('mongoose');
const config = require('../../config/config.json');

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

<<<<<<< HEAD
module.exports.getRecordByToken = (token, callback) => {
    const query = {
        token
    };
    LoggedIn.findOne(query, callback);
=======
module.exports.getRecordByToken = async (token) => {
    const query = { token };
    return await LoggedIn.findOne(query);
>>>>>>> fe9a9b2be704a723b852981f069b73f745e1676d
};

module.exports.removeRecordByToken = (token, callback) => {
    const query = {
        token
    };
    LoggedIn.deleteOne(query, callback)
};