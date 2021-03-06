(function (window) {
	'use strict';

	function VocableManager(fromLanguage, toLanguage) {
		var me = this;

		me.fromLanguage = fromLanguage;
		me.toLanguage = toLanguage;

		me.getApiUrl = function (vocable, fromLang, toLang) {
			if (!fromLang) {
				fromLang = 'auto';
			}
			if (!toLang) {
				toLang = me.toLanguage;
			}

			var url = 'http://translate.google.com/translate_a/t?client=x&text=' + vocable + '&sl=' + fromLang + '&tl=' + toLang;
			console.log(url);

			return window.encodeURI(url);
		};

		me.changeSourceLanguage = function (sourceLanguage) {
			me.fromLanguage = sourceLanguage;
		};

		me.changeTargetLanguage = function (targetLanguage) {
			me.toLanguage = targetLanguage;
		};

		me.getSourceLanguage = function () {
			return me.fromLanguage;
		};

		me.getTargetLanguage = function () {
			return me.toLanguage;
		};

		me.prepareTranslationObject = function (json) {
			var translationObject = {
				v: json.sentences[0].orig,
				sourceLanguage: json.src,
				sections: []
			};

			if (json.dict) {
				json.dict.forEach(function (entry) {
					var section = {
						name: entry.pos,
						translations: []
					};

					entry.entry.forEach(function (translation, index) {
						if (index > 3) {
							return;
						}

						var t = translation.previous_word || '';
						t += ' ' + translation.word;
						t = t.trim();

						section.translations.push(t);
					});

					translationObject.sections.push(section);
				});
			} else {
				translationObject.sections.push({
					name: 'sentence',
					translations: [json.sentences[0].trans]
				});
			}

			return translationObject;
		};

		me.ajax = function (url, callback) {
			var request = new window.XMLHttpRequest();

			request.open('GET', url, true);
			request.timeout = 5000;
			request.onload = function () {
				if (request.status >= 200 && request.status < 400) {
					return callback(null, request.responseText);
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

		me.getTranslation = function (vocable, fromLang, toLang, callback) {
			var url = me.getApiUrl(vocable, fromLang, toLang);

			me.ajax(url, function (error, result) {
				var json,
					translationObject;

				if (error) {
					return callback(error, null);
				}

				json = JSON.parse(result);
				translationObject = me.prepareTranslationObject(json);
				return callback(null, translationObject);
			});
		};

		return me;
	}

	window.VocableManager = VocableManager;
})(window);