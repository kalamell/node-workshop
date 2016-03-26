function product(opts){
  // Members
  var self = this;
  //var db = opts.db;
  // Methods
  /*self.add = function(item,callback){
    products =db.getCollection('products');
    if(products==null){
    products =db.addCollection('products',{ indices: ['id']});
    }
    products.insert(item);
    db.save(function(){
      callback(item);
    });
  }*/

  self.add = function(item,callback){
    var fs = require('fs');
    fs.exists('data/productDB.json',function(exist){
      console.log(exist);
    })
    fs.appendFile('data/productDB.json', JSON.Stringify(item), (err) => {
           if (err) callback(err);
           callback(item);
  }
  /*self.get = function(id,callback){
    var products = db.getCollection('products');
    console.log(products);
    var product = products.get(parseInt(id));
    console.log(product);
    callback(product);
  }
  self.edit = function(params,callback){
    var products = db.getCollection('products');
    console.log(params);
    if (params.id){
      var product = products.get(params.id);
      console.log(product);
      for(var key in params.newVal){
        if(key != "id"){
          product[key] = params.newVal[key];
        }
      }
      products.update(product);
      db.save();
      callback(products.get(params.id);
    }
    else{
      return {"message":"Not found id!"};
    }

  }
  self.remove = function(condition,callback){
    var products = db.getCollection('products');
    //console.log(req.body);
    var founds = products.find(condition);
    console.log(founds);
    var iDeleted =0;
    for(var i = founds.length-1 ; i >-1;i--){
      products.remove(founds[i]);
      iDeleted++;
    }
    if(iDeleted >0){
      db.save();
      callback ({"message":"Already Deleted!"});
    }
    else
      callback ({"message":"Not Found Data!"});
  }*/
}

module.exports = product;
