var config = require('config');
var baseDAO ={};
switch (config.DB_PROVIDER) {
  case "OrientDB":
    baseDAO = require('dao/orientdb');
    break;
}
module.exports = baseDAO;
