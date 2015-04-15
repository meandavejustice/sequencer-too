var accountdown = require('accountdown');
var level = require('level-prebuilt');
var db = level('./users.db');

var users = accountdown(db, {
    login: { basic: require('accountdown-basic') }
});

var opts = {
    login: { basic: { username: 'meandave', password: 'fuck you' } },
    value: { bio: 'fuck you all' }
};
// users.create('meandave', opts, function (err) {
//     if (err) return console.error(err);
// });

// var creds = { username: 'meandave', password: 'fuck you' };
// users.verify('basic', creds, function (err, ok, id) {
//     if (err) return console.error(err)
//     console.log('ok=', ok);
//     console.log('id=', id);
// });

var stream = users.list()
stream.pipe(process.stdout)// .on('data', function(data) {
//   console.log(data);
// })