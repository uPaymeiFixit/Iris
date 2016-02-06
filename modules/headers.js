module.exports = {
    OnlineStatus: Object.freeze({ // jshint ignore:line
        ONLINE: 'Online',
        AWAY: 'Away',
        OFFLINE: 'Offline'
    }),
    ChatStatus: Object.freeze({ // jshint ignore:line
        MUTED: 'Muted',
        NONE: ''
    }),
    Chat: function (name, id, status, chatStatus, image, lastActive, history, profiles) { // jshint ignore:line
        this.name = name;
        this.id = id;
        this.status = status;
        this.chatStatus = chatStatus;
        this.image = image;
        this.lastActive = lastActive;
        this.history = history;
        this.profiles = profiles;
        this.draftText = '';
    }
};
