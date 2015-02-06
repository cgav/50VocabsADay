(function (window) {
	'use strict';

	function DKTranslator (vocable, fromLanguage, toLanguage) {
		var me = this;

		me.vocable = vocable;
		me.fromLanguage = fromLanguage;
		me.toLanguage = toLanguage;

		me.initialize = function () {
			if (chrome) {
				me.ajax('http://www.ordbogen.com/', function (error, result) {
					if (result.indexOf('Logget ind') === -1) {
						// redirect to login page
						chrome.tabs.create({url: 'http://www.ordbogen.com'}, function (tab) {
							chrome.tabs.executeScript(tab.id, {runAt: 'document_end', code: 'document.getElementById("loginButton").getElementsByTagName("a")[0].click()'});
						});
					}
				});
			}
		};

		me.getApiUrl = function () {
			var lang = 'daty';
			var url = 'http://www.ordbogen.com/opslag.php?word=' + me.vocable + '&dict=' + lang;
			return window.encodeURI(url);
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

		me.getTranslation = function (callback) {
			me.ajax(me.getApiUrl(), function (error, result) {
				if (error) {
					return callback(error, null);
				}

				console.log(result);
				return callback(null, result);
			});
		};

		me.initialize();
	}

	window.DKTranslator = DKTranslator;
})(window);