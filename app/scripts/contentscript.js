(function () {
	'use strict';

	// --------------------------------
	// helper functions
	// --------------------------------
	var getSentence = function (text, from, to) {
		var stopChars = ':;.!?',
			fromIndex = from,
			toIndex = to,
			sentence = '';

		text = text.substr(0, from) + '<b>' + text.substr(from, to - from) + '</b>' + text.substr(to);
		while (stopChars.indexOf(text[fromIndex - 1]) === -1 && fromIndex > 0) {
			fromIndex--;
		}

		while (stopChars.indexOf(text[toIndex - 1]) === -1 && toIndex < text.length) {
			toIndex++;
		}

		sentence = text.substr(fromIndex, toIndex - fromIndex);
		return sentence.trim();
	};

	var getSelection = function () {
		var selection = window.getSelection(),
			from = selection.anchorOffset,
			to = selection.focusOffset,
			sentence = getSentence(selection.focusNode.textContent, from, to),
			selectionObject = {
				selection: selection.toString(),
				from: from,
				to: to,
				sentence: sentence
			};

		console.log(selectionObject);

		return selectionObject;
	};

	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		if (message.type === 'GET-SELECTION') {
			return sendResponse(getSelection());
		}
		return true;
	});
})();