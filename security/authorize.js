function authorize(logonList){
  var self = this;
  var _ = require('underscore');
  var message = {code:504,status:'error',message:"Unauthorized!"};
  var sessionTimeout = 90000;

  this.getAccessToken = function(user,callback){
    if(!user.name || user.name.length ==0 || !user.password
      || user.password.length ==0 || !user.accessToken
      || user.accessToken.length ==0){
        callback(message);
      }
      else {
        self.validateToken(user,function(isValid){

          if(isValid){
            self.registerToken(user,function(result){
              if(result.guid){
                message.code =200;
                message.status ="completed";
                message.result = result;
                delete message.message;
                callback(message);
              }
            });
          }
          else{
            callback(message);
          }
        });
    }

  }

  this.validateToken =function(user,callback){
    var config = require('config');
    var CryptoJS = require('crypto-js');
    var bytes  = CryptoJS.Rabbit.decrypt( config.API_USERS,config.SECRET_KEY);
    var allowedUserList = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    var bytes2 = CryptoJS.Rabbit.decrypt(user.accessToken
    , config.SECRET_KEY);
    var allowedToken = JSON.parse(bytes2.toString(CryptoJS.enc.Utf8));
    var users =  _.where(allowedUserList,{"name":user.name,"password":user.password});


    if(users.length >0 && user.name == allowedToken.name && user.password == allowedToken.password){
      callback(true);
    }
    else{
      callback(false);
    }
  }

  this.registerToken = function(user,callback){
    var newLogonList = _.filter(logonList,function(a){
       return a.name != user.name;
    });
    // guid
    var Guid = require('guid');
  	var _guid = Guid.create();
    // expiredAt
    var now = new Date();
		var expiredAt = new Date(now.getTime() + sessionTimeout );
    user.guid = _guid;
    user.expiredAt = expiredAt;
    logonList.push(user);
    callback(user);
  }

  this.isAuthorized = function(guid,callback){
    // isExist
    if(!guid){
      callback(message);
      return;
    }
    var logon =_.filter(logonList,function(l){
      return l.guid.toString() == guid;
    });

    if(logon.length ==0){
      callback(message);
      return;
    }
    // isExpired
    var now = new Date();
    if (now.getTime() >logon[0].expiredAt.getTime() ){
      console.log('expired');
      var newLogonList = _.filter(logonList,function(a){
         return a.name != user.name;
      });
      logonList = newLogonList;
      message.code =505;
      message.status ="error";
      message.message = "Token already expired!";
      callback(message);
      return;
    }
    else {
      // isAllowed
      message.code =200;
      message.status ="completed";
      message.message = "Token is authorized";
      callback(message);
    }
  }
}

module.exports = authorize;
