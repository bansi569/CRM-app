var mysql = require('mysql');

var pool  = mysql.createPool({
  connectionLimit:50,
  host:'127.0.0.1',
  user:'webapp',
  password:'pswdapp',
  database:'homeautomation',
  multipleStatements: true
});

module.exports = pool;
