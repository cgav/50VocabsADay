'use strict';

var shutupUntil = Date.now(),
	vocableManager = new window.VocableManager('en', 'de');

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

// ------------------------------------
// Event listener
// ------------------------------------
chrome.runtime.onInstalled.addListener(function (details) {
	console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.type === 'SHUT-UP') {
		shutup(message.duration);
	} else if (message.type === 'GET-TRANSLATION') {
		vocableManager.getTranslation(message.vocable, function (err, translation) {
			sendResponse({
				err: err,
				translation: translation
			});
		});
	}
	
	return true;
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
	if (changeInfo.status === 'loading' && changeInfo.url) {
		console.log('Current url: ' + changeInfo.url + ', shutting up for ' + ((shutupUntil - Date.now()) / 1000) + ' seconds.');

		if ((shutupUntil - Date.now()) < 0) {
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
