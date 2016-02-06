var bcrypt = require('bcrypt-nodejs');

module.exports = {
    hashPassword: function (password) {
        return bcrypt.hashSync(password);
    },
    comparePassword: function (correct, testing) {
        return bcrypt.compareSync(testing, correct);
    },
    validateEmail: function (email) {
        return (typeof email === 'string' &&
                email.length >= 5 &&
                email.indexOf(' ') === -1 &&
                email.split('@').length === 2 &&
                email.split('.').length >= 2 &&
                email.split('@')[1].indexOf('.') > 0 &&
                email.indexOf('@') !== 0 &&
                email.indexOf('.') !== email.length - 1
            );
    }
};
