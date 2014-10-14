(function (window) {
	'use strict';

	function VocableManager(fromLanguage, toLanguage) {
		this.fromLanguage = fromLanguage;
		this.toLanguage = toLanguage;

		this.getApiUrl = function (vocable) {
			var url = 'http://api.mymemory.translated.net/get?q=' + vocable + '&langpair=' + this.fromLanguage + '|' + this.toLanguage;

			return window.encodeURI(url);
		};

		this.getTranslation = function (vocable, callback) {
			var request = new window.XMLHttpRequest(),
				url = this.getApiUrl(vocable);

			request.open('GET', url, true);
			request.timeout = 5000;
			request.onload = function () {
				var json;

				if (request.status >= 200 && request.status < 400) {
					json = JSON.parse(request.responseText);
					return callback(null, json.responseData.translatedText);
				}

				return callback({
					message: 'Wrong response code from API server: ' + request.status
				}, null);
			};
			request.ontimeout = function () {
				return callback({
					message: 'Request timed out. Try it again later.'
				}, null);
			};
			request.onerror = function (err) {
				return callback({
					message: err.message
				}, null);
			};

			request.send();
		};

		return this;
	}

	window.VocableManager = VocableManager;
})(window);