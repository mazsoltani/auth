const User = require('../src/models/user');
const staticNames = require('../src/static/names');
const errorMessages = require('./../src/static/errorMessages');

module.exports.create = () => {
    const adminUser = new User({
        email: staticNames.adminEmail,
        password: staticNames.adminPassword,
        role: staticNames.adminRole,
        verified: false
    });
    User.getUserByEmail(adminUser.email, (err, user) => { // check to see if admin user exists
        if (err) {
            console.error(errorMessages.createAdminFailedError);
        }
        if (!user) {
            User.createUser(adminUser, (err, user) => { // add admin user if doesn't already exist
                if (err) {
                    console.error(errorMessages.createAdminFailedError);
                }
            });
        }
    });
};