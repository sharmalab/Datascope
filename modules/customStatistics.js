/* 
	Load datalib library for performing statistics.
*/
var dl = require('datalib');

/*
	Function representing a one dimenisional statistic.
	It computes and return the sum of an attribute from a dataset.
*/
global.sum = function (data, attr) {
	var sum = 0;
	for (index in data) {
		sum += data[index][attr];
	}
	return sum;
};

/*
	Function representing a two dimensional statistc.
	It computes the mean of two attributes of a dataset and returns the product of the results.
*/
global.twoDimMean = function (data, attr1, attr2) {
	var summary1 = dl.summary(data, [attr1])[0];
	var summary2 = dl.summary(data, [attr2])[0];

	var myMean = summary1["mean"] * summary2["mean"];

	return myMean;
};