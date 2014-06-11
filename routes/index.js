
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
exports.index2 = function(req,res){
	res.render('index2')
}
exports.index3 = function(req,res){
	res.render('index3')
}