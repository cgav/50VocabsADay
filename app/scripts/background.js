'use strict';

//
// How to get all level 7 vocabs:
// chrome.storage.local.get(null, function (items) { console.log(Object.keys(items).filter(function (i) { console.log(i); return items[i].l === 7 })) })
//

var shutupUntil = Date.now(),
	vocableManager = new window.VocableManager('en', 'de'),
	levels = {
		1: 600 * 1000,					// 10 minutes
		2: 3600 * 1000,					// 1 hour
		3: 5 * 3600 * 1000,				// 5 hours
		4: 24 * 3600 * 1000,			// 24 hours
		5: 25 * 24 * 3600 * 1000,		// 25 days
		6: 120 * 24 * 3600 * 1000,		// 120 days
		7: 365 * 24 * 3600 * 1000,		// 365 days
		8: 2 * 365 * 24 * 3600 * 1000	// 2 years
	},
	nextPeriod = Date.now(),
	popupTranslation = null;

// ------------------------------------
// Helper functions
// ------------------------------------
var sendUrl = function (tabId, url) {
	chrome.tabs.get(tabId, function (tab) {
		if (tab.status !== 'complete') {
			window.setTimeout(function () {
				sendUrl(tabId, url);
			}, 100);
		} else {
			// sending URL
			chrome.tabs.sendMessage(tabId, {
				type: 'REDIRECT-URL',
				redirectUrl: url
			});
		}
	});
};

var deleteVocable = function (timestamp) {
	// deleting next record
	chrome.storage.local.get('next', function (nextRecord) {
		var vocableName;

		if (!nextRecord.next) {
			return;
		}

		vocableName = nextRecord.next[timestamp];
		delete nextRecord.next[timestamp];
		chrome.storage.local.set(nextRecord, function () {
			// deleting vocable
			chrome.storage.local.remove(vocableName);
		});
	});
};

var shutup = function (duration) {
	chrome.storage.local.get('meta', function (metaRecord) {
		if (!metaRecord.meta) {
			metaRecord.meta = {};
		}
		metaRecord.meta.shutupUntil = Date.now() + duration * 1000;
		shutupUntil = metaRecord.meta.shutupUntil;
		chrome.storage.local.set(metaRecord, function () {
			console.log('Shutting up for ' + duration + ' seconds until ' + new Date(metaRecord.meta.shutupUntil));
		});
	});
};

var updateShutupUntil = function () {
	chrome.storage.local.get('meta', function (metaRecord) {
		var now = Date.now();
		if (!metaRecord.meta) {
			shutupUntil = now;
			return;
		}

		if (metaRecord.meta.shutupUntil < now) {
			shutupUntil = now;
			return;
		}

		shutupUntil = metaRecord.meta.shutupUntil || now;
	});
};

var updateNextPeriod = function () {
	chrome.storage.local.get('next', function (nextRecord) {
		var keys;

		if (!nextRecord.next) {
			return;
		}

		keys = Object.keys(nextRecord.next);
		if (keys.length > 0) {
			nextPeriod = parseInt(keys[0]);
		}
	});
};

var setNinjaMode = function (start, callback) {
	chrome.storage.local.get('meta', function (metaRecord) {
		if (!metaRecord.meta) {
			metaRecord.meta = {};
		}

		metaRecord.meta.ninjaMode = start;
		chrome.storage.local.set(metaRecord, function () {
			if (typeof callback === 'function') {
				return callback();
			}
		});
	});
};

var getNinjaMode = function (callback) {
	chrome.storage.local.get('meta', function (metaRecord) {
		if (typeof callback === 'function') {
			var ninjaMode = false;

			if (metaRecord.meta && metaRecord.meta.ninjaMode) {
				ninjaMode = metaRecord.meta.ninjaMode;
			}

			return callback(ninjaMode);
		}
	});
};

var changeTargetLanguage = function (targetLanguage, callback) {
	chrome.storage.local.get('meta', function (metaRecord) {
		if(!metaRecord.meta) {
			metaRecord.meta = {};
		}

		metaRecord.meta.targetLanguage = targetLanguage;
		vocableManager.changeTargetLanguage(targetLanguage);
		chrome.storage.local.set(metaRecord, function () {
			if (typeof callback === 'function') {
				return callback();
			}
		});
	});
};

var getTargetLanguage = function (callback) {
	chrome.storage.local.get('meta', function (metaRecord) {
		if (!metaRecord.meta || !metaRecord.meta.targetLanguage) {
			// default setting
			changeTargetLanguage(vocableManager.getTargetLanguage(), function () {
				if (typeof callback === 'function') {
					return callback(vocableManager.getTargetLanguage());
				}
			});
		} else {
			vocableManager.changeTargetLanguage(metaRecord.meta.targetLanguage);
			if (typeof callback === 'function') {
				return callback(metaRecord.meta.targetLanguage);
			}
		}
	});
};

var storeVocable = function (vocable, translation, sentence, sourceLanguage, callback) {
	var record = {};

	// check whether vocable already exists
	vocable = vocable.trim();
	chrome.storage.local.get('_' + vocable, function (vocableRecord) {
		if (vocableRecord['_' + vocable]) {
			console.log('Vocable \'' + vocable + '\' does already exist. It will not be stored.');

			// vocable does already exist
			if (typeof callback === 'function') {
				return callback({unique: false});
			}
		} else {

			// storing selected vocable
			record['_' + vocable] = {
				v: vocable,
				t: translation,
				s: sentence,
				l: 1,
				ts: Date.now() + levels[1],
				language: {
					from: sourceLanguage,
					to: vocableManager.getTargetLanguage()
				}
			};
			chrome.storage.local.set(record, function () {

				// storing timestamp when vocable should be checked next
				chrome.storage.local.get('next', function (nextRecord) {
					if (!nextRecord.next) {
						nextRecord.next = {};
					}

					// next check in 10 minutes
					nextRecord.next[record['_' + vocable].ts] = '_' + vocable;
					chrome.storage.local.set(nextRecord, function () {
						if (typeof callback === 'function') {
							return callback({unique: true});
						}
					});
				});
			});
		}
	});
};

var getNextVocable = function (callback) {
	chrome.storage.local.get('next', function (nextRecord) {
		var keys,
			nextKey,
			nextVocable;

		if (nextRecord.next) {
			keys = Object.keys(nextRecord.next);
			nextKey = keys.shift();
			if (nextKey) {
				nextVocable = nextRecord.next[nextKey];
				chrome.storage.local.get(nextVocable, function (nextVocableObject) {
					if (!(nextVocable in nextVocableObject)) {
						// data is inconsistent -> delete record from list
						deleteVocable(nextKey);
						return callback(null);
					}

					return callback(nextVocableObject[nextVocable]);
				});
			} else {
				return callback(null);
			}
		} else {
			return callback(null);
		}
	});
};

var calculateNewTimestamp = function (nextLevel) {
	return Date.now() + levels[nextLevel];
};

var updateNextObject = function (vocableObject, newTimestamp, callback) {
	chrome.storage.local.get('next', function (nextRecord) {
		if (!nextRecord.next) {
			nextRecord.next = {};
		}

		delete nextRecord.next[vocableObject.ts];
		nextRecord.next[newTimestamp] = '_' + vocableObject.v;
		chrome.storage.local.set(nextRecord, function () {
			return callback();
		});
	});
};

var updateVocable = function (vocableObject, callback) {
	var recordToStore = {},
		newTimestamp = calculateNewTimestamp(vocableObject.l);

	// if (vocableObject.l > 6) {
	// 	deleteVocable(vocableObject.ts);
	// 	return callback(false);
	// }

	// update next object
	updateNextObject(vocableObject, newTimestamp, function () {
		// check whether level increased
		vocableObject.ts = newTimestamp;

		// updating vocable record
		recordToStore['_' + vocableObject.v] = vocableObject;
		chrome.storage.local.set(recordToStore, function () {
			if (vocableObject.l === 1) {
				// user did wrong -> next vocable
				getNextVocable(function (nextVocableObject) {
					return callback(!!nextVocableObject);
				});
			} else {
				nextPeriod = Date.now() + 15 * 60 * 1000;
				return callback(false);
			}
		});
	});
};

var getAllVocables = function (callback) {
	var getVocable,
		vocables = {};

	getVocable = function (vocable) {
		var dfd = window.when.defer();

		chrome.storage.local.get(vocable, function (vocableObject) {
			if (vocableObject[vocable]) {
				if (vocableObject[vocable].ts) {
					vocables[vocableObject[vocable].ts].l = vocableObject[vocable].l;
					vocables[vocableObject[vocable].ts].t = vocableObject[vocable].t;
					vocables[vocableObject[vocable].ts].s = vocableObject[vocable].s;
					vocables[vocableObject[vocable].ts].language = vocableObject[vocable].language;
				}
				else {
					var ts = +new Date() + 10000000;
					vocables[ts] = {
						l: vocableObject[vocable].l,
						t: vocableObject[vocable].t,
						s: vocableObject[vocable].s,
						language: vocableObject[vocable].language
					};
				}
			}
			dfd.resolve();
		});

		return dfd.promise;
	};

	chrome.storage.local.get('next', function (nextRecord) {
		var dfds = [];

		if (!nextRecord.next) {
			return callback({});
		}

		for (var ts in nextRecord.next) {
			vocables[ts] = {
				v: nextRecord.next[ts],
				t: '',
				s: '',
				l: 0
			};
			dfds.push(getVocable(vocables[ts].v));
		}

		window.when.all(dfds).then(function () {
			return callback(vocables);
		});
	});
};

var searchVocable = function (vocable, fromLang, toLang, callback) {
	vocableManager.getTranslation(vocable, fromLang, toLang, callback);
};

// ------------------------------------
// Event listener
// ------------------------------------
chrome.runtime.onInstalled.addListener(function (details) {
	console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.type === 'SHUT-UP') {
		shutup(message.duration);
	} else if (message.type === 'GET-NEXT-VOCABLE') {
		getNextVocable(function (nextVocableObject) {
			getNinjaMode(function (ninjaMode) {
				sendResponse({
					nextVocable: nextVocableObject,
					ninjaMode: ninjaMode
				});
			});
		});
	} else if (message.type === 'UPDATE-VOCABLE') {
		updateVocable(message.vocable, function (hasNext) {
			sendResponse(hasNext);
		});
	} else if (message.type === 'GET-ALL-VOCABLES') {
		getAllVocables(function (vocables) {
			sendResponse(vocables);
		});
	} else if (message.type === 'GET-SHUT-UP-UNTIL') {
		sendResponse(shutupUntil);
	} else if (message.type === 'RESET-SHUT-UP-UNTIL') {
		shutup(0);
		sendResponse(null);
	} else if (message.type === 'GET-NEXT-VOCABLE-IN-DATE') {
		sendResponse(nextPeriod);
	} else if (message.type === 'DELETE-VOCABLE') {
		deleteVocable(message.timestamp);
	} else if (message.type === 'SEARCH-VOCABLE') {
		searchVocable(message.v, message.fromLang, message.toLang, function (error, translationResult) {
			console.log(translationResult);
			sendResponse({
				error: error,
				translationResult: translationResult
			});
		});
	} else if (message.type === 'CHANGE-POPUP-TRANSLATION') {
		if (message.v && message.t) {
			popupTranslation = {
				v: message.v,
				t: message.t,
				sourceLanguage: message.sourceLanguage
			};
		} else {
			popupTranslation = null;
		}
	} else if (message.type === 'CHANGE-TARGET-LANGUAGE') {
		changeTargetLanguage(message.language, function () {
			sendResponse();
		});
	} else if (message.type === 'GET-TARGET-LANGUAGE') {
		getTargetLanguage(function (language) {
			sendResponse(language);
		});
	} else if (message.type === 'ADD-TRANSLATION') {
		storeVocable(message.vocable, message.translation, message.sentence, message.sourceLanguage, function () {
			sendResponse('done');
		});
	} else if (message.type === 'SET-NINJA-MODE') {
		setNinjaMode(message.value, function () {
			sendResponse('done');
		});
	} else if (message.type === 'GET-NINJA-MODE') {
		getNinjaMode(sendResponse);
	}

	return true;
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
	var now = Date.now();

	if (changeInfo.status === 'loading' && changeInfo.url) {
		console.log('Shutting up for ' +
			parseInt((shutupUntil - Date.now()) / 1000) +
			' seconds, nextPeriod in ' +
			parseInt((nextPeriod - Date.now()) / 1000) +
			' seconds.'
		);

		if (changeInfo.url.indexOf('chrome://newtab') === 0 || changeInfo.url.indexOf('chrome-extension://') === 0 || now < nextPeriod) {
			return;
		}

		getNextVocable(function (nextVocableObject) {
			if (nextVocableObject && shutupUntil - now < 0 && now > nextVocableObject.ts) {
				chrome.tabs.update(tabId, {
					url: '/50vad.html',
					highlighted: true
				}, function () {
					sendUrl(tabId, changeInfo.url);
				});
			}
		});
	}
});

chrome.runtime.onConnect.addListener(function (popupPort) {
	console.log('Popup connected to background page');

	popupPort.onDisconnect.addListener(function () {
		if (popupTranslation) {
			console.log('Popup disconnected -> storing popup translation');
			storeVocable(popupTranslation.v, popupTranslation.t, '', popupTranslation.sourceLanguage);
			popupTranslation = null;
		}
	});
});

// ------------------------------------
// Entry point
// ------------------------------------
updateShutupUntil();
updateNextPeriod();
getTargetLanguage();

// creating context menus
chrome.contextMenus.create({
	type: 'normal',
	title: 'Translate with 50VocabsADay',
	contexts: ['selection'],
	onclick: function (info, tab) {
		// new window.DKTranslator();
		var searchFn,
			message = {
				type: 'GET-SELECTION'
			};

		searchFn = function (vocable, sentence, fromLang, toLang) {
			searchVocable(vocable, fromLang, toLang, function (error, translationObject) {
				var translationMessage = {
					type: 'TRANSLATION',
					translationObject: translationObject
				};

				chrome.tabs.sendMessage(tab.id, translationMessage, function (response) {
					if (response.changeLanguage) {
						searchFn(vocable, sentence, response.fromLang, response, toLang);
					} else if (response.store) {
						storeVocable(vocable, response.translation, sentence, translationObject.sourceLanguage);
					}
				});
			});
		};

		chrome.tabs.sendMessage(tab.id, message, function (response) {
			searchFn(response.selection, response.sentence, vocableManager.getSourceLanguage(), vocableManager.getTargetLanguage());
			// vocableManager.getTranslation(response.selection, function (err, translationObject) {
			// 	var translationMessage = {
			// 			type: 'TRANSLATION',
			// 			translationObject: translationObject
			// 		};

			// 	chrome.tabs.sendMessage(tab.id, translationMessage, function (_response) {
			// 		if (_response.store) {
			// 			storeVocable(translationObject.v, translationObject.t, response.sentence, translationObject.sourceLanguage);
			// 		}
			// 	});
			// });
		});
	}
});
