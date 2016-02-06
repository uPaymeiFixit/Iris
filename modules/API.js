var app;
var database;
var passport = require('passport');
var strategies = {
    local: require('passport-local')
    // facebook: require('passport-facebook').Strategy
    // google: require('passport-google')
};
// var credentials = require('./credentials');

// function ensureAuthenticated (req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/');
// }

function ensureAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send({error: 'You are not authenticated'});
}

module.exports = {
    prefix: '/api/',

    init: function (_app, _database) {
        app = _app;
        database = _database;

        passport.serializeUser(function (user, done) {
            done(null, user);
        });
        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });

        passport.use(new strategies.local(
            function (username, password, done) {
                database.getAdminByUsername(username.toLowerCase(), function (admin) {
                    if (password === admin.password) {
                        return done(null, admin);
                    } else {
                        return done(null, false);
                    }
                });
            }
        ));
        // passport.use(new strategies.facebook({
        //         clientID: credentials.facebook.app_id,
        //         clientSecret: credentials.facebook.secret,
        //         callbackURL: 'http://' + process.env.HOSTNAME + '/api/login/facebook/return'
        //     },
        //     function (accessToken, refreshToken, profile, done) {
        //         // TODO: remove the next few lines so that user info isn't shared accidently
        //         leprofile = profile;
        //         lerefreshtoken = refreshToken;
        //         leaccesstoken = accessToken;
        //         // asynchronous verification, for effect...
        //         console.log('line 40: ' + JSON.stringify(profile));
        //         process.nextTick(function () {
        //             database.getUserByToken(['ID', 'username', 'email', 'first_name', 'last_name', 'order_placed'], profile.id, profile.provider, function (user) {
        //                 console.log('line 43: ' + JSON.stringify(profile));
        //                 if (user === undefined) {
        //                     var splitName = profile.name.split(' ');
        //                     var firstName = splitName[0];
        //                     var lastName = splitName[splitName.length - 1];
        //                     var userString = '(facebook_login_token, first_name, last_name)' +
        //                                      'VALUES (' + profile.id + ', ' + firstName + ', ' + lastName + ')';
        //                     database.addUser(userString, function (user) {
        //                         return done(null, user);
        //                     });
        //                 } else {
        //                     return done(null, profile);
        //                 }
        //             });
        //         });
        //     }
        // ));
        app.use(
            require('cookie-parser')(),
            require('method-override')('X-HTTP-Method-Override'),
            // TODO: figure out what express session is, and what I should replace 'keyboard cat' with
            require('express-session')({secret: 'keyboard cat', saveUninitialized: true, resave: true}),
            passport.initialize(),
            passport.session()
        );

        app.post(this.prefix + 'checkin', function (req, res) {
            if (req.accepts('json')) {
                database.getLastCheckin(req.body.userID, function (checkin) {
                    database.getUserLocationByID(req.body.userID, function (location) {
                        if (req.body.locationID === undefined || req.body.locationID === location.location) {
                            if ((checkin === undefined || checkin.in === undefined || checkin.out !== undefined)) {
                                // User is checking in
                                database.addCheckin(req.body.userID, req.body.time, function (msg) {
                                    var response = {
                                        response: msg
                                    };
                                    response.response.message = 'Checked in';
                                    res.send(response);
                                });
                            } else if (checkin !== undefined && checkin.out === undefined) {
                                // User is checking out
                                if (req.body.time > parseInt(checkin.in) + 43200 /*12 hours*/) {
                                    database.addCheckin(req.body.userID, req.body.time, function (msg) {
                                        var startOfDay = new Date(req.body.time * 1000);
                                        startOfDay.setUTCHours(0, 0, 0, 0);
                                        var response = {
                                            response: msg,
                                            dialog: {
                                                message: 'Forgot to check out',
                                                checkinID: checkin._id,
                                                day: startOfDay.getTime() / 1000
                                            }
                                        };
                                        response.response.message = 'Checked in';
                                        res.send(response);
                                    });
                                } else if (checkin.in < req.body.time) {
                                    database.endCheckin(checkin._id, req.body.time, function (err) {
                                        var response = {};
                                        if (err) {
                                            response.error = err;
                                        } else {
                                            response.response = {
                                                message: 'Checked out',
                                                time: req.body.time - checkin.in
                                            };
                                        }
                                        res.send(response);
                                    });
                                } else {
                                    var response = {
                                        response: {
                                            error: 'Checkout time was earlier than checkin time'
                                        }
                                    };
                                    res.send(response);
                                }
                            } else {
                                res.send(checkin);
                            }
                        }
                    });
                });
            }
        });
        app.post(this.prefix + 'old_checkin', function (req, res) {
            // TODO: add authentication to ensure the employees aren't just sending bare POSTs
            console.log('GOT OLD CHECKIN REQUEST: ' + JSON.stringify(req.body));
            database.getCheckinByID(req.body.checkinID, function (checkin) {
                if (checkin === undefined) {
                    res.send('bad checkinID');
                    return;
                }
                console.log('FOUND CHECKIN: ' + checkin);
                if (checkin.out === undefined) {
                    console.log('CHECKIN.OUT === undefined');
                    database.endCheckin(req.body.checkinID, req.body.time, function (msg) {
                        var response = {
                            message: msg
                        };
                        console.log('SENDING RESPONSE: ' + response);
                        res.send(response);
                    });
                }
            });
        });
        app.get(this.prefix + 'checkins', ensureAuthenticated, function (req, res) {
            database.getCheckinsByUserID(req.query.userID, parseInt(req.query.skip), 30, function (checkins) {
                res.send({
                    last: parseInt(req.query.skip) + checkins.length,
                    checkins: checkins
                });
            });
        });
        app.put(this.prefix + 'checkins', ensureAuthenticated, function (req, res) {
            database.updateCheckinByID(req.body._id, req.body.update, function (dbUpdate) {
                res.send();
            });
        });
        app.get(this.prefix + 'locations', ensureAuthenticated, function (req, res) {
            if (req.accepts('json')) {
                if (req.query !== undefined && req.query.latitude !== undefined && req.query.longitude !== undefined) {
                    database.getLocationsSorted(req.query.latitude, req.query.longitude, function (data) {
                        res.send(data);
                    });
                } else {
                    database.getLocations(function (data) {
                        res.send(data);
                    });
                }
            }
        });
        app.get(this.prefix + 'reports', ensureAuthenticated, function (req, res) {
            var beginningOfMonth = new Date();
            beginningOfMonth.setUTCDate(1);
            beginningOfMonth.setUTCHours(0, 0, 0, 0);
            var timeRange = {
                start: parseInt(beginningOfMonth.getTime() / 1000),
                stop: parseInt(Date.now() / 1000)
            };
            if (req.query.time_start !== undefined && req.query.time_start !== '') {
                timeRange.start = parseInt(req.query.time_start);
            }
            if (req.query.time_stop !== undefined && req.query.time_stop !== '') {
                timeRange.stop = parseInt(req.query.time_stop);
            }

            var workerReports = [];
            var reportsCallback = function () {
                res.send(workerReports);
            };
            if (req.query.userID === undefined || req.query.userID === '') {
                database.getUsers(function (users) {
                    for (var i = 0; i < users.length; i++) {
                        if (users[i] !== undefined) {
                            (function (_i) {
                                database.getCheckinsByUser(users[_i]._id.toString(), timeRange.start, timeRange.stop, function (checkins) {
                                    var worker = {
                                        first_name: users[_i].first_name,
                                        last_name: users[_i].last_name,
                                        position: users[_i].position,
                                        hourly_rate: users[_i].hourly_rate,
                                        location: users[_i].location,
                                        shifts: []
                                    };
                                    for (var j = 0; j < checkins.length; j++) {
                                        var duration = Math.round(((checkins[j].out - checkins[j].in) / 3600) * 100) / 100;
                                        var checkin = {
                                            date: new Date(checkins[j].in * 1000).toLocaleString(),
                                            // TODO: add support for multiple shifts per day
                                            duration: duration,
                                            pay: ((Math.round(duration * users[_i].hourly_rate * 100)) / 100)
                                        };
                                        worker.shifts.push(checkin);
                                    }
                                    workerReports.push(worker);
                                    if (workerReports.length >= users.length) {
                                        reportsCallback();
                                    }
                                });
                            })(i);
                        }
                    }
                });
            } else {
                // TODO: accept an array of userIDs, instead of just 1
                if (!Array.isArray(req.query.userID)) {
                    req.query.userID = [req.query.userID];
                }
                for (var i in req.query.userID) {
                    (function (_i) {
                        database.getUserByID(req.query.userID[_i], function (user) {
                            if (user !== undefined) {
                                database.getCheckinsByUser(req.query.userID[_i], timeRange.start, timeRange.stop, function (checkins) {
                                    var worker = {
                                        first_name: user.first_name,
                                        last_name: user.last_name,
                                        position: user.position,
                                        hourly_rate: user.hourly_rate,
                                        location: user.location,
                                        shifts: []
                                    };
                                    for (var j = 0; j < checkins.length; j++) {
                                        var duration = Math.round(((checkins[j].out - checkins[j].in) / 3600) * 100) / 100;
                                        var checkin = {
                                            date: new Date(checkins[j].in * 1000).toLocaleString(),
                                            // TODO: add support for multiple shifts per day
                                            duration: duration,
                                            pay: ((Math.round(duration * user.hourly_rate * 100)) / 100)
                                        };
                                        worker.shifts.push(checkin);
                                    }
                                    workerReports.push(worker);
                                    if (workerReports.length === req.query.userID.length) {
                                        reportsCallback();
                                    }
                                });
                            }
                        });
                    })(i);
                }
            }
        });
        app.get(this.prefix + 'user', function (req, res) {
            if (req.query !== undefined && req.query.phone !== undefined) {
                database.getUserByPhone(req.query.phone, function (user) {
                    if (!user || !user.error) {
                        res.send(user);
                    } else {
                        res.send({message: user.error});
                    }
                });
            } else {
                database.getUsers(function (users) {
                    if (!users.error) {
                        res.send(users);
                    } else {
                        res.send({message: users.error});
                    }
                });
            }
        });
        app.post(this.prefix + 'user', ensureAuthenticated, function (req, res) {
            var validPosition = false;
            var validLocation = false;
            database.getPositions(function (positions) {
                for (var i in positions) {
                    if (positions[i]._id == req.body.position) {
                        validPosition = true;
                        database.getLocations(function (locations) {
                            for (var i in locations) {
                                console.log(locations[i]._id + ' === ' + req.body.location);
                                if (locations[i]._id == req.body.location) {
                                    validLocation = true;
                                    if (req.body.hourly_rate < 8) {
                                        res.send({error: 'hourly rate too low'});
                                    } else {
                                        var user = {
                                            first_name: req.body.first_name,
                                            last_name:  req.body.last_name,
                                            position: req.body.position,
                                            location: req.body.location,
                                            hourly_rate: req.body.hourly_rate,
                                            address: {
                                                street: req.body.street,
                                                city: req.body.city,
                                                state: req.body.state,
                                                zip_code: req.body.zip_code
                                            },
                                            phone: req.body.phone
                                        };
                                        database.addUser(user, function (_id) {
                                            res.send(_id);
                                        });
                                    }
                                    return;
                                }
                            }
                            if (!validLocation) {
                                res.send({error: 'invalid location'});
                            }
                        });
                    }
                }
                if (!validPosition) {
                    res.send({error: 'invalid position'});
                }
            });
        });
        app.put(this.prefix + 'user', ensureAuthenticated, function (req, res) {
            if (req.body.update.phone && typeof req.body.update.phone === 'string') {
                req.body.update.phone = parseInt(req.body.update.phone.replace(/\D/g, ''));
            }
            database.editUser(req.body.userID, req.body.update, function (userID) {
                if (userID.error) {
                    res.send(userID);
                } else {
                    res.send(userID);
                }
            });
        });
        app.delete(this.prefix + 'user', ensureAuthenticated, function (req, res) {
            database.deleteUser(req.query.userID, function (err) {
                res.send(err);
            });
        });
        app.get(this.prefix + 'position', ensureAuthenticated, function (req, res) {
            database.getPositions(function (positions) {
                if (!positions.error) {
                    res.send(positions);
                } else {
                    res.send({message: positions.error});
                }
            });
        });
        app.post(this.prefix + 'position', ensureAuthenticated, function (req, res) {
            database.addPosition({title: req.body.title}, function (position) {
                console.log('POSITION: ' + position);
                if (!position.error) {
                    res.send({message: 'success', _id: position});
                } else {
                    res.send({message: position.error});
                }
            });
        });
        app.post(this.prefix + 'location', ensureAuthenticated, function (req, res) {
            database.addLocation({address: req.body.address, city: req.body.city, state: req.body.state, zip_code: req.body.zip_code}, function (location) {
                console.log('LOCATION: ' + location);
                if (!location.error) {
                    res.send({message: 'success', _id: location});
                } else {
                    res.send({error: location.error});
                }
            });
        });
        app.put(this.prefix + 'account', ensureAuthenticated, function (req, res) {
            if (req.body.password !== undefined && req.body.password.change.length >= 4) {
                database.changePassword(req.body.username, req.body.password.current, req.body.password.change, function (update) {
                    res.send(update);
                });
            } else {
                res.send({error: 'password is too short'});
            }
            console.log(req.body);
        });
        app.post(this.prefix + 'login/local', passport.authenticate('local', {failureRedirect: '/'}),
            function (req, res) {
                res.send({
                    message: 'authenticated',
                    user: {
                        _id: req.user._id,
                        first_name: req.user.first_name,
                        last_name: req.user.last_name,
                        username: req.user.username,
                        email: req.user.email
                    }
                });
            }
        );
        // app.get(this.prefix + 'login/facebook', passport.authenticate('facebook',
        //     {
        //         failureRedirect: '/login'
        //         // profileFields: ['id', 'displayName']
        //     }),
        //     function (req, res) {
        //         // res.redirect('/');
        //     }
        // );
        // app.get(this.prefix + 'login/facebook/return', passport.authenticate('facebook',
        //     {failureRedirect: '/login'}),
        //     function (req, res) {
        //         // console.log(req);
        //         // sucessful auth
        //         // res.redirect('/');
        //         res.send(JSON.stringify(leprofile));
        //     }
        // );
        app.get(this.prefix + 'logout', function (req, res) {
            req.logout();
            res.redirect('/');
        });

        return this;
    },
    start: function () {

    },
    stop: function () {

    }
};
