'use strict';

var urlCount = 0;

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

// ------------------------------------
// Event listener
// ------------------------------------
chrome.runtime.onInstalled.addListener(function (details) {
	console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	console.log(message);
	console.log(sender);
	console.log(sendResponse);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
	if (changeInfo.status === 'loading' && changeInfo.url) {
		urlCount++;
		console.log('Current update count: ' + urlCount + ', url: ' + changeInfo.url);

		if (urlCount % 3 === 0) {
			chrome.tabs.update(tabId, {
				url: '/50vad.html'
			}, function () {
				sendUrl(tabId, changeInfo.url);
			});
		}
	}
});