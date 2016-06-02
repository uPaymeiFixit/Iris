var app;
var loadPages;

module.exports = {

    init: function (_app, _loadPages) {
        app = _app;
        loadPages = _loadPages;

        app.post('/dev_api/reload_pages', function (req, res) {
            console.log('reloading pages');
            loadPages();
            res.send({message: 'success'});
        });

        return this;
    },
    start: function () {

    }
};
