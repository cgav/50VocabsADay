(function () {
	'use strict';

	var message = {
		type: 'GET-TRANSLATION',
		vocable: 'car'
	};

	chrome.runtime.sendMessage(message, function (response) {
		console.log(response);
	});
})();