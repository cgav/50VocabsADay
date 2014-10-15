(function ($) {
	'use strict';

	// --------------------------------
	// Variables
	// --------------------------------
	var lastCoords = {
		x: 0,
		y: 0
	};
	var $box;
	var responseToTranslation;

	// --------------------------------
	// Helper functions
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

	var showModal = function (vocable, translation) {
		$box = $('<div>')
			.addClass('fvad-box');

		$box.append(
			$('<p>').text(vocable)
				.addClass('fvad-vocable')
		);
		$box.append(
			$('<p>').text(translation)
				.addClass('fvad-translation')
		);
		$box.append(
			$('<div>').addClass('fvad-button-area')
				.append(
					$('<button>').text('Don\'t add vocable to training')
						.addClass('fvad-button')
						.addClass('fvad-dont-add-button')
				)
		);

		$(document.body).append($box);
	};

	// --------------------------------
	// Event listener
	// --------------------------------
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		if (message.type === 'GET-SELECTION') {
			return sendResponse(getSelection());
		} else if (message.type === 'TRANSLATION') {
			showModal(message.vocable, message.translation);
			responseToTranslation = sendResponse;
		}
		return true;
	});

	window.oncontextmenu = function (event) {
		lastCoords.x = event.x;
		lastCoords.y = event.y;
	};

	$(document).on('click', function (event) {
		if (event.target.className.indexOf('fvad-') === 0) {
			return;
		}

		if ($box) {
			if (typeof responseToTranslation === 'function') {
				responseToTranslation({store: true});
			}
			$box.remove();
		}
	});

	$(document).on('click', '.fvad-dont-add-button', function () {
		if (typeof responseToTranslation === 'function') {
			responseToTranslation({store: false});
			$box.remove();
		}
	});
})(window.$);