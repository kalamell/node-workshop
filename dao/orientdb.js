var OrientDB = require('orientjs');
var config = require('config');

var server = OrientDB({
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASSWORD
});

var db = {type:"graph"};

db.init = function(user){
  db.orientdb = server.use({name:config.DB_DATABASE,
    username: user.name,
    password: user.password
  });
  if(db.name)
    db.isConnected = true;
  else
    db.isConnected = false;
}

db.serverClose = function(){
  server.close();
}
db.serverList = function(){
  server.list().then(function(dbs){
    return dbs;
  });
}

db.insert = function(doc,callback){
  switch (db.type) {
    case "graph":
      db.insertGraph(doc,callback);
      break;
    case "document":
      db.insertDoc(doc,callback);
      break;
  }
}

db.insertDoc = function(doc,callback){
  db.orientdb.insert().into(db.className)
  .set(doc).one()
  .then(function (o) {
     callback(o);
  });
}

db.insertGraph = function(doc,callback){
  db.orientdb.create('VERTEX', db.className)
  .set(doc)
  .one()
  .then(function (vertex) {
    callback(vertex);
  });
}

db.update = function(item,callback){
  console.log(item.item);
  console.log(db.className);

  db.orientdb.update(db.className)
  .set(item.item)
  .where(item.condition).scalar()
  .then(function (total) {
    callback(total)
  });
}

db.delete = function(doc,callback){
  db.orientdb.delete()
  .from(db.className).where(doc)
  .all()
  .then(function (total) {
    callback(total);
  });
}
db.select =function(condition){
  switch (condition.mode) {
    case "selectAll":
      return selectAll(condition.where);
    case "selectLimit":
      return selectLimit(condition);
  }
}

db.query = function(command,condition){
db.orientdb.query(command,{params:condition})
  .then(function(result){
    return {status:200,result:result};
  });
}

db.close = function(){
  db.orientdb.close();
  db.isConnected = false;
}

db.selectAll=function(callback){
  db.orientdb.class.get(db.className)
  .then(function (MyClass) {
     MyClass.list()
    .then(function (records) {
      console.log('Found ' + records.length + ' records:', records);
      callback(records);
    });
  });
}



function selectLimit(condition){
  var command ="select * ,$records[0].count as total from {0} {where} LET $records = ";
  command +="(select count(*) from {0} {where}) skip :skip limit :limit ";
  command = command.replace(/{0}/g, db.className);

  var limit={};

  if(condition.where)
    command = command.replace(/{where}/g, condition.where);
  else
    command = command.replace(/{where}/g, "");

  if(condition.skip)
    limit.skip = parseInt(condition.skip);
  else
    limit.skip =0;

  if(condition.limit)
    limit.limit = parseInt(condition.limit);
  else
    limit.limit =10;

  return  db.query(command,limit);

}


module.exports = db;
