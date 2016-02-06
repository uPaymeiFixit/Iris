var chalk = require('chalk');
var mongojs = require('mongojs');

var db;
var collections = ['users', 'checkins', 'locations', 'positions', 'admins'];
var credentials = require('./credentials');

module.exports = {
    init: function () {
        if (db === undefined) {
            var creds = {};
            var databaseUrl = '';
            if (process.env.MONGOLAB_URI) {
                databaseUrl = process.env.MONGOLAB_URI;
            } else {
                creds.username = credentials.mongodb.username;
                creds.password = credentials.mongodb.password;
                databaseUrl = 'mongodb://' + creds.username + ':' + creds.password + '@ds047030.mongolab.com:47030/poki-time';
            }
            db = mongojs(databaseUrl, collections, {authMechanism: 'ScramSHA1'});
            db.on('error', function (err) {
                console.log(err);
                db = mongojs(databaseUrl, collections, {authMechanism: 'ScramSHA1'});
            });
        }
        return this;
    },
    disconnect: function () {
        if (db !== undefined) {
            db.close();
        }
    },
    getUsers: function (callback) {
        // TODO: strip sensitive info from the request
        db.users.find({}, function (err, users) {
            if (err) {
                callback(err);
            } else {
                callback(users);
            }
        });
    },
    getUserByPhone: function (phone, callback) {
        db.users.find({phone: mongojs.NumberLong(phone)}, function (err, users) {
            if (err) {
                callback(err);
            } else {
                callback(users[0]);
            }
        });
    },
    getLocations: function (callback) {
        db.locations.find(function (err, locations) {
            if (err) {
                console.log(chalk.red(err));
                callback(err);
            }
            callback(locations);
        });
    },
    getLocationsSorted: function (lat, long, callback) {
        this.getLocations(function (locations) {
            // TODO: sort the array by geolocational nearness
            callback(locations);
        });
    },
    getUserByID: function (userID, callback) {
        // TODO: strip sensitive info from the request
        db.users.find({_id: mongojs.ObjectId(userID)}, function (err, user) {
            if (err) {
                callback({err: err});
            }
            callback(user[0]);
        });
    },
    getAdminByUsername: function (username, callback) {
        // TODO: strip sensitive info from the request
        db.admins.find({username: username}, function (err, admin) {
            if (err) {
                callback({err: err});
            }
            callback(admin[0]);
        });
    },
    getUserLocationByID: function (userID, callback) {
        // TODO: strip sensitive info from the request
        db.users.find({_id: mongojs.ObjectId(userID)}, {location: 1}, function (err, user) {
            if (err) {
                callback({err: err});
            }
            callback(user[0]);
        });
    },
    addUser: function (user, callback) {
        // verify there are no other users with username and that the email is valid
        // db.users.find({username: user.username}, function (err, users) {
        //     if (users.length === 0) {
        user.date_started = Math.round(Date.now() / 1000);
        db.users.save(user, function (err, saved) {
            if (err) {
                callback(err);
            } else {
                // TODO: use nodemailer in the wherever the callback goes to send an email with user info (QR code)
                callback(saved._id);
            }
        });
        //     } else {
        //         callback('User already exists');
        //     }
        // });
    },
    editUser: function (userID, update, callback) {
        delete update._id;
        db.users.update({_id: mongojs.ObjectId(userID)}, {$set: update}, function (err, user) {
            if (err) {
                callback({error: err});
            } else {
                callback({id: user._id});
            }
        });
    },
    deleteUser: function (userID, callback) {
        db.users.remove({_id: mongojs.ObjectId(userID)}, function (err, res) {
            if (err) {
                callback({error: err});
            } else {
                callback(undefined);
            }
        });
    },
    getPositions: function (callback) {
        db.positions.find(function (err, positions) {
            if (err) {
                callback({error: JSON.stringify(err)});
            } else {
                callback(positions);
            }
        });
    },
    addPosition: function (position, callback) {
        db.positions.find({title: position.title}, function (err, positions) {
            if (positions.length === 0) {
                db.positions.save({title: position.title}, function (err, saved) {
                    if (err) {
                        callback({error: JSON.stringify(err)});
                    } else {
                        callback(saved._id);
                    }
                });
            } else {
                callback({error: 'Position already exists'});
            }
        });
    },
    addLocation: function (location, callback) {
        db.locations.find(location, function (err, locations) {
            if (locations.length === 0) {
                db.locations.save(location, function (err, saved) {
                    if (err) {
                        callback({error: JSON.stringify(err)});
                    } else {
                        callback(saved._id);
                    }
                });
            } else {
                callback({error: 'Location already exists'});
            }
        });
    },
    getCheckins: function (callback) {
        db.checkins.find(function (err, checkins) {
            if (err) {
                callback(err);
            } else {
                callback(checkins);
            }
        });
    },
    getCheckinsByUser: function (userID, time_start, time_stop, callback) {
        db.checkins.find({user: userID, in: {$gte: time_start, $lt: time_stop}}, function (err, checkins) {
            if (err) {
                callback(err);
            } else {
                callback(checkins);
            }
        });
    },
    getCheckinByID: function (ID, callback) {
        db.checkins.find({_id: mongojs.ObjectId(ID)}, function (err, checkins) {
            if (err) {
                callback(err);
            } else {
                callback(checkins[0]);
            }
        });
    },
    getCheckinsByUserID: function (userID, skip, limit, callback) {
        db.checkins.find({user: userID}).sort({in:-1}).skip(skip).limit(limit, function (err, checkins) {
            if (err) {
                callback(err);
            } else {
                callback(checkins);
            }
        });
    },
    updateCheckinByID: function (ID, update, callback) {
        db.checkins.update({_id: mongojs.ObjectId(ID)}, {$set: update}, function (err, msg) {
            if (err) {
                callback(err);
            } else {
                callback(msg);
            }
        });
    },
    getLastCheckin: function (userID, callback) {
        db.checkins.find({user: userID}).sort({in:-1}).limit(1, function (err, checkin) {
            if (err) {
                callback(err);
            } else {
                callback(checkin[0]);
            }
        });
    },
    addCheckin: function (userID, time, callback) {
        this.getUserByID(userID, function (user) {
            if (user === undefined || user.err !== undefined) {
                // could not find user
                callback(user);
            } else {
                db.checkins.insert({user: userID, in: parseInt(time)}, function (err, checkin) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(checkin);
                    }
                });
            }
        });
    },
    endCheckin: function (checkinID, time, callback) {
        db.checkins.update({_id: mongojs.ObjectId(checkinID)}, {$set: {out: parseInt(time)}}, function (err, dbRes) {
            if (err) {
                callback(err);
            } else {
                callback();
            }
        });
    },
    changePassword: function (username, oldPassword, newPassword, callback) {
        console.log(username + ' ' + oldPassword + ' ' + newPassword);
        db.admins.find({username: username}, function (err, user) {
            console.log(JSON.stringify(user));
            if (!err && user[0]) {
                if (oldPassword === user[0].password) {
                    db.admins.update({username: username}, {$set: {password: newPassword}}, function (err, update) {
                        callback(update);
                    });
                } else {
                    callback({error: 'old password is incorrect'});
                }
            } else {
                callback();
            }
        });
    }
};
