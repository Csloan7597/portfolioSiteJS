/**
 * Created by conor on 24/08/2014.
 */

var app = require('./app');

var ipaddr = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

console.log('PORT: ' + port + ' IP ADDR: ' + ipaddr);

app.set('port', port);
app.set('ipaddr', ipaddr);

var server = app.listen(app.get('port'), app.get('ipaddr'));
console.log('Listening...');
