
//"use strict";

const version = "75";

var debug = true;
export const loaded = function () {
	_loaded();
};

function _loaded() {
	
//	let arr = [ "fred", "tom", "bob" ];  
//	for (let i of arr) {  
//	    console.log(i);  
//	} 

	var arr = ["fred", "tom", "bob"];
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;
	try {
		for (var _iterator = arr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var i = _step.value;
			console.log(i);
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}
}
