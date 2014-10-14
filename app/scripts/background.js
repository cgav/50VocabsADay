'use strict';

var shutupUntil = Date.now(),
	vocableManager = new window.VocableManager('en', 'de'),
	levels = {
		1: 600 * 1000,
		2: 3600 * 1000,
		3: 5 * 3600 * 1000,
		4: 24 * 3600 * 1000,
		5: 25 * 24 * 3600 * 1000,
		6: 120 * 24 * 3600 * 1000
	};

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
		if (!metaRecord.meta) {
			shutupUntil = Date.now();
			return;
		}

		shutupUntil = metaRecord.meta.shutupUntil || Date.now();
	});
};

var storeVocable = function (vocable, translation) {
	var record = {};

	// storing selected vocable
	record['_' + vocable] = {
		v: vocable,
		t: translation,
		s: '... no sentence yet ...',
		l: 1,
		ts: Date.now() + 600 * 1000
	};
	chrome.storage.local.set(record);

	// storing timestamp when vocable should be checked next
	chrome.storage.local.get('next', function (nextRecord) {
		if (!nextRecord.next) {
			nextRecord.next = {};
		}

		// next check in 10 minutes
		nextRecord.next[record['_' + vocable].ts] = '_' + vocable;
		chrome.storage.local.set(nextRecord);
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

var updateVocable = function (vocableObject, callback) {
	var recordToStore = {},
		oldTimestamp = vocableObject.ts;

	// check whether level increased
	if (vocableObject.l === 1) {
		// user did wrong
		getNextVocable(function (nextVocableObject) {
			// TODO: update next!
			return callback(!!nextVocableObject);
		});
	} else {
		// updating vocable record
		vocableObject.ts = Date.now() + levels[vocableObject.l];
		recordToStore['_' + vocableObject.v] = vocableObject;
		chrome.storage.local.set(recordToStore, function () {
			// updating next record
			chrome.storage.local.get('next', function (nextRecord) {
				if (!nextRecord.next) {
					nextRecord.next = {};
				}

				delete nextRecord.next[oldTimestamp];
				nextRecord.next[vocableObject.ts] = '_' + vocableObject.v;
				chrome.storage.local.set(nextRecord, callback);
			});
		});
	}
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
			console.log(nextVocableObject);
			sendResponse(nextVocableObject);
		});
	} else if (message.type === 'UPDATE-VOCABLE') {
		updateVocable(message.vocable, function (hasNext) {
			sendResponse(hasNext);
		});
	}

	return true;
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
	if (changeInfo.status === 'loading' && changeInfo.url) {
		console.log('Current url: ' + changeInfo.url + ', shutting up for ' + ((shutupUntil - Date.now()) / 1000) + ' seconds.');

		// if ((shutupUntil - Date.now()) < 0) {
		if (changeInfo.url.indexOf('chrome-extension://') === -1) {
		// if (false) {
			chrome.tabs.update(tabId, {
				url: '/50vad.html'
			}, function () {
				sendUrl(tabId, changeInfo.url);
			});
		}
	}
});

// ------------------------------------
// Entry point
// ------------------------------------
updateShutupUntil();

// creating context menus
chrome.contextMenus.create({
	type: 'normal',
	title: 'Translate with 50VocabsADay',
	contexts: ['selection'],
	onclick: function (info) {
		var vocable = info.selectionText;

		vocableManager.getTranslation(vocable, function (err, translation) {
			if (err) {
				console.log(err);
				return;
			}

			storeVocable(vocable, translation);
		});
	}
});
