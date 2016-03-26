var express = require("express");

var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
require('rootpath')();
var winston = require('winston');
var useragent = require('useragent');
var logonList =[];

var CryptoJS = require('crypto-js');
var data ={name:"admin",password:"p@ssw0rd"};
var ciphertext = CryptoJS.Rabbit.encrypt(JSON.stringify(data), 'secret key 123');
console.log(ciphertext.toString());

function execGet(req,res,next){
  var params = req.params[0].split('/');
  console.log('params',params);
  //[0]- empty,[1]-module,[2]-object,[3]-function,[4-n] params..n
  if(params.length <4)
    res.send({code:530,status:"error",message:"Invalid parameters!"});
  else{
    var obj = require('api/'+params[1]+'/' +params[2]);
    obj = new obj(app);
    var func =obj[params[3]];
    var inputs =[];
    for(var i=4;i<params.length;i++){
      if(params[i])
        inputs.push(params[i]);
    }

    console.log('inputs:',inputs);
    func(inputs,function(result){
      res.send(result);
      writeResLog(req,'error',err);
    });
  }
}

  function execPost(req,res,next){
  var params = req.params[0].split('/');
  console.log(params);
  //[0]- empty,[1]-module,[2]-object,[3]-function,[4-n] params..n
  if(params.length <4)
    res.send({code:530,status:"error",message:"Invalid parameters!"});
  else{
    try{
      var obj = require('api/'+params[1]+'/' +params[2]);
      obj = new obj(app);
      var func =obj[params[3]];
      var data = req.body;
      delete data.guid;
      func(req.body,function(result){
        res.send(result);
        writeResLog(req,'info',result);
      });
    }
    catch(err){
      res.send({code:500,status:"error",message:JSON.stringify(err) });
      writeResLog(req,'error',err);
    }
  }
}

function executeApi(req,res,next){
    switch(req.method){
      case "GET":
        execGet(req,res,next);
      break;
      case "POST":
        execPost(req,res,next);
      break;
      case "PUT":
        execPost(req,res,next);
      break;
      case "DELETE":
        execPost(req,res,next);
      break;
    }
}

var _guid ="";
function getGuid(req,res,next){
	var Guid = require('guid');
	_guid = Guid.create();
	req.guid = _guid;
  console.log(_guid);
	next();
}

function getReqLog(log,req){
	log.guid = req.guid;
	log.sessionID = req.sessionID;
	log.ip =req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	/*var user =logonList.findOne({sessionID:req.sessionID});
	if(user)
		log.userName = user.userName;*/
	log.url = req.params;
	log.method = req.method;
	var agent = useragent.parse(req.headers['user-agent']);
	log.os = agent.os;
	log.device = agent.device;
  log.browser = agent.toString();

	return log;
}

function getResLog(log,level,req,result){
	log.guid = req.guid;
	if(level=='info')
		log.result  = result;
	else
		log.message = result;

	return log;
}

function writeLog(level,step,req,result){
	var log = {};
	var now = new Date();
	var fileName = now.toISOString().substring(0,10);
	log.step = step;

	switch(step){
		case "start":
			log = getReqLog(log,req);
		break;
		case "end":
			log = getResLog(log,level,req,result);
		break;
	}
	  var logger = new winston.Logger({
		level: level,
		transports: [
			  new (winston.transports.File)({ filename: 'logs/'+fileName+ '.log' })
			]
		});
		console.log(log);
		logger.log(level, log);
}

function writeReqLog(req,res,next){
	writeLog('info','start',req);
	next();
}

function writeResLog(req,level,result){
		writeLog(level,'end',req,result);
}

function checkAuthorize(req,res,next){
  var authorize = require('security/authorize');
  auth = new authorize(logonList);

  if(req.params[0] == '/security/authorize/login'){
    if(!req.body.guid){
      auth.getAccessToken(req.body,function(result){
        console.log(logonList);
        res.send(result);
      });
    }
  }
  else{
    next();
  }
}

function checkToken(req,res,next){
  var authorize = require('security/authorize');
  console.log(logonList)
  auth = new authorize(logonList);
  auth.isAuthorized(req.body.guid,function(result){
    if(result.code ==200){
      next();
    }
    else{
      res.send(result);
    }
  })
}

app.all('*',checkAuthorize,checkToken,getGuid,writeReqLog,executeApi);

app.listen(3000);
console.log("My Service is listening to port 3000.");

process.on('uncaughtException', function (err) {
  console.error((new Date).toISOString() + ' uncaughtException:', err.message);
});
