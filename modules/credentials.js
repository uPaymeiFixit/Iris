var fs = require('fs');

module.exports = {
    apiKey: {
        root: 'keyboard_cat'
    },
    TLScertificate: {
        certificate: fs.readFileSync('./modules/certificates/cert.pem'),
        privateKey: fs.readFileSync('./modules/certificates/key.pem')
    },
    mongodb: {
        username: 'TbtMHajmTBRwChbGYKCf',
        password: 'qUEntm34aRjDaxtuFdjC'
    }
};
