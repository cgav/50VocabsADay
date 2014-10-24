(function (window) {
	'use strict';

	function VocableManager(fromLanguage, toLanguage) {
		var me = this;

		me.fromLanguage = fromLanguage;
		me.toLanguage = toLanguage;

		me.getApiUrl = function (vocable) {
			var url = 'http://translate.google.com/translate_a/t?client=x&text=' + vocable + '&hl=' + this.fromLanguage + '&sl=auto&tl=' + this.toLanguage;

			return window.encodeURI(url);
		};

		me.prepareTranslationObject = function (json) {
			var translationObject = {
				v: json.sentences[0].orig,
				t: json.sentences[0].trans
			};

			return translationObject;
		};

		me.getTranslation = function (vocable, callback) {
			var request = new window.XMLHttpRequest(),
				url = me.getApiUrl(vocable);

			request.open('GET', url, true);
			request.timeout = 5000;
			request.onload = function () {
				var json,
					translationObject;

				if (request.status >= 200 && request.status < 400) {
					json = JSON.parse(request.responseText);
					translationObject = me.prepareTranslationObject(json);
					return callback(null, translationObject);
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

		return me;
	}

	window.VocableManager = VocableManager;
})(window);