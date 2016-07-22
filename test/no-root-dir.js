describe('[desktop] no root dir', function(){
  var should = require('should');

  var desktop = require('../lib');

  it('should rise error when no root folder is informed', function(){
    should.throws(function(){
      desktop();
    });
  });

});
