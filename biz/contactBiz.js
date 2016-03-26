
var db = require('dao/base');
var _ = require('underscore');
var result = {status:200,message:"completed",result:{}};
db.className = "Contacts";

db.init({name:'admin',password:'admin'});

var contactBiz = {};
contactBiz.add = function(item,callback){

	db.insertDoc(item,function(o){
		var r = _.clone(result);

		if(!o){
			r.status=510;
			r.message ="[Error add contact !] ";
		}
		r.result = o;
		callback(r);
	});
}

contactBiz.getAll = function(callback){
	db.selectAll(function(list){
		var r = _.clone(result);
		if(!list){
			r.status=511;
			r.message ="[Error get contacts !] ";
		}
		r.result = list;
		callback(r);
	});
}

contactBiz.update = function(params,callback){
	var r = _.clone(result);
	var total =db.update(params,function(total){
		r.result = total;
		callback(r);
	});

}

contactBiz.delete = function(params,callback){
	var r = _.clone(result);
	var total = db.delete(params,function(total){
		r.result = total;
		callback(r);
	});
}

module.exports = contactBiz;
