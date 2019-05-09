const User = require('../src/models/user');
const staticNames = require('./../src/static/names.json');

module.exports.create = () => {
    const adminUser = new User({
        name: staticNames.adminName,
        email: staticNames.adminEmail,
        password: staticNames.adminPassword,
        profileImage: staticNames.adminProfile,
        role: staticNames.adminRole
        });
    User.getUserByEmail(adminUser.email, (err, user) => { // check to see if admin user exists
        if(err){
            console.log("Couldn't create the admin user");
        }
        if(!user){
            User.createUser(adminUser, (err, user) => { // add admin user if doesn't already exist
                if(err){
                    console.log("Couldn't create the admin user");
                }
            });
        }
    });
};