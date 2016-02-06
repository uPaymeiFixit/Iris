var WEBSITE_PORT = (process.env.PORT || 8080);
// var WEBSITE_PORT_TLS = 443;

var fs = require('fs');

var credentials = require('./credentials');
var http = require('http');
// var https = require('https');
var express = require('express');
var app = express();
var server;
var bodyParser = require('body-parser');
app.use(
    bodyParser.json(),
    bodyParser.urlencoded({
        extended: true
    })
);

var pages = {
    reports: {
        name: 'reports',
        html: null
    },
    // locations: {
    //     name: 'locations',
    //     html: null
    // },
    login: {
        name: 'login',
        html: null
    },
};
var parts = {
    header: {
        name: 'header',
        html: null
    },
    footer: {
        name: 'footer',
        html: null
    }
};

function fillPages () {
    for (var page in pages) {
        pages[page].html = pages[page].html.replace('{{header}}', parts.header.html.replaceAll('{{page}}', page));
        pages[page].html = pages[page].html.replace('{{footer}}', parts.footer.html.replaceAll('{{page}}', page));
    }
}

function loadPages () {
    parts.header.html = fs.readFileSync('./modules/pages/parts/common/header.html').toString();
    parts.footer.html = fs.readFileSync('./modules/pages/parts/common/footer.html').toString();
    if (process.env.NODE_ENV === 'development') {
        parts.header.html += '<script src="//localhost:35729/livereload.js"></script>';
    }
    for (var page in pages) {
        pages[page].html = fs.readFileSync('./modules/pages/' + pages[page].name + '.html').toString();
    }

    fillPages();
}

function ensureAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function ensureNotAuthenticated (req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/reports');
}

module.exports = {
    init: function () {
        loadPages();
        return this;
    },
    start: function () {
        app.engine('html', require('ejs').renderFile);
        app.set('view engine', 'html');

        app.use(express.static('./modules/pages/'));
        app.get('/', ensureNotAuthenticated, function (req, res) {
            res.send(pages.login.html);
        });
        app.get('/reports', ensureAuthenticated, function (req, res) {
            res.send(pages.reports.html);
        });
        // app.get('/login', ensureNotAuthenticated, function (req, res) {
        //     res.send(pages.login.html);
        // });
        // app.get('/order', ensureAuthenticated, function (req, res) {
        //     var loggedIn = true;
        //     if (loggedIn) {
        //         res.send(pages.order.html);
        //     }
        // });
        app.use(function (req, res) {
            res.status(404);
            if (req.accepts('html')) {
                res.send('404 ' + req.url);
                return;
            }
            if (req.accepts('json')) {
                res.send({error: 'Not found'});
                return;
            }
            res.type('txt').send('Not found');
        });

        server = http.createServer(app).listen(WEBSITE_PORT, function () {
            console.log('web server listening on *:' + WEBSITE_PORT);
        });
        // server = https.createServer(credentials.TLScertificate, app).listen(WEBSITE_PORT_TLS, function () {
        //     console.log('web server listening on *:' + WEBSITE_PORT_TLS);
        // });
    },
    stop: function () {
        server.close();
        return true;
    },
    getApp: function () {
        return app;
    },
    getServer: function () {
        return server;
    },
    loadPages: function () {
        loadPages();
    }
};

String.prototype.replaceAll = function (find, replace) {
    return this.replace(new RegExp(find, 'g'), replace);
};
