const bcrypt = require("bcryptjs");

const updateUserPasswordHash = async (user, newPassword, done) => {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(newPassword, salt);
    user.password = hash;
    await user.save();
    return done();
};

module.exports = {updateUserPasswordHash};