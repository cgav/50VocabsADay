(function (/*angular*/) {
	'use strict';

	// var app = angular.module('fvad-app-modal', ['language-selector', 'MessageServiceModule']),
	// 	fvad = document.createElement('fvad-wrapper'),
	// 	el = document.createElement('fvad-modal'),
	// 	elOverlay = document.createElement('fvad-overlay');

	// // ------------------------------------------
	// // Services
	// // ------------------------------------------
	// app.service('DisplayService', function () {
	// 	var me = this,
	// 		hideModalCallback,
	// 		hideOverlayCallback,
	// 		showOverlayCallback;

	// 	me.registerHideModalCallback = function (callback) {
	// 		hideModalCallback = callback;
	// 	};

	// 	me.registerHideOverlayCallback = function (callback) {
	// 		hideOverlayCallback = callback;
	// 	};
	// 	me.registerShowOverlayCallback = function (callback) {
	// 		showOverlayCallback = callback;
	// 	};

	// 	// hide overlay
	// 	me.hideOverlay = function () {
	// 		if (typeof hideOverlayCallback === 'function') {
	// 			hideOverlayCallback();
	// 		}
	// 	};
	// 	me.showOverlay = function () {
	// 		if (typeof showOverlayCallback === 'function') {
	// 			showOverlayCallback();
	// 		}
	// 	};

	// 	// hide modal
	// 	me.hideModal = function () {
	// 		if (typeof hideModalCallback === 'function') {
	// 			hideModalCallback();
	// 		}
	// 	};

	// 	return me;
	// });

	// // ------------------------------------------
	// // Directives
	// // ------------------------------------------
	// app.directive('fvadOverlay', [
	// 	'DisplayService',
	// 	function (DisplayService) {
	// 		return {
	// 			restrict: 'E',
	// 			link: function (scope, element) {
	// 				var hideOverlay,
	// 					showOverlay;

	// 				//
	// 				// Scope definitions
	// 				//
	// 				scope.overlayDisplayed = false;
	// 				// scope.$apply();

	// 				//
	// 				// Helper functions
	// 				//
	// 				hideOverlay = function () {
	// 					scope.overlayDisplayed = false;
	// 					scope.$apply();
	// 				};
	// 				showOverlay = function () {
	// 					scope.overlayDisplayed = true;
	// 					scope.$apply();
	// 				};

	// 				//
	// 				// Event listener
	// 				//
	// 				element.bind('click', function () {
	// 					console.log('hi');
	// 					DisplayService.hideOverlay();
	// 					DisplayService.hideModal();
	// 				});

	// 				//
	// 				// Entry point
	// 				//
	// 				DisplayService.registerHideOverlayCallback(hideOverlay);
	// 				DisplayService.registerShowOverlayCallback(showOverlay);
	// 			},
	// 			template: '<div class="fvad-overlay" ng-show="overlayDisplayed"></div>',
	// 			transclude: true
	// 		};
	// 	}
	// ]);

	// app.directive('fvadModal', [
	// 	'MessageService',
	// 	'DisplayService',
	// 	function (MessageService, DisplayService) {
	// 		return {
	// 			restrict: 'E',
	// 			link: function (scope) {
	// 				var getSentence,
	// 					getSelection,
	// 					hideModal,
	// 					responseToTranslation,
	// 					selectedVocable;

	// 				//
	// 				// Scope definitions
	// 				//
	// 				scope.vocable = 'vocable';
	// 				scope.translation = 'translation';
	// 				scope.modalDisplayed = false;
	// 				scope.fromLang = 'auto';
	// 				scope.toLang = 'en';
	// 				scope.dontAddTranslation = function () {
	// 					if (typeof responseToTranslation === 'function') {
	// 						responseToTranslation({store: false});
	// 						scope.modalDisplayed = false;
	// 					}

	// 					DisplayService.hideOverlay();
	// 				};
	// 				scope.init = function () {
	// 					MessageService.sendMessage({
	// 						type: 'GET-TARGET-LANGUAGE'
	// 					}, function (language) {
	// 						scope.toLang = language;
	// 					});
	// 				};
	// 				scope.fromLanguageSelected = function (language) {
	// 					if (typeof responseToTranslation === 'function') {
	// 						responseToTranslation({
	// 							changeLanguage: true,
	// 							fromLang: language
	// 						});
	// 					}
	// 				};
	// 				scope.toLanguageSelected = function (language) {
	// 					console.log('to selected language', language);
	// 				};
	// 				scope.isSelected = function (section, translation) {
	// 					return selectedVocable.section === section && selectedVocable.translation === translation;
	// 				};
	// 				scope.changeSelectedVocable = function (section, translation) {
	// 					selectedVocable.section = section;
	// 					selectedVocable.translation = translation;
	// 				};

	// 				//
	// 				// Helper functions
	// 				//
	// 				getSentence = function (text, from, to) {
	// 					var stopChars = ':;.!?',
	// 						fromIndex = from,
	// 						toIndex = to,
	// 						sentence = '';

	// 					text = text.substr(0, from) + '<b>' + text.substr(from, to - from) + '</b>' + text.substr(to);
	// 					while (stopChars.indexOf(text[fromIndex - 1]) === -1 && fromIndex > 0) {
	// 						fromIndex--;
	// 					}

	// 					while (stopChars.indexOf(text[toIndex - 1]) === -1 && toIndex < text.length) {
	// 						toIndex++;
	// 					}

	// 					sentence = text.substr(fromIndex, toIndex - fromIndex);
	// 					return sentence;
	// 				};

	// 				getSelection = function () {
	// 					var selection = window.getSelection(),
	// 						from = selection.anchorOffset,
	// 						to = selection.focusOffset,
	// 						sentence = getSentence(selection.focusNode.textContent, from, to),
	// 						totalSentence = '',
	// 						selectionObject,
	// 						childNodes = selection.anchorNode.parentNode.childNodes;

	// 					for (var i = 0; i < childNodes.length; i++) {
	// 						if (childNodes[i] === selection.anchorNode) {
	// 							totalSentence += sentence;
	// 						} else {
	// 							totalSentence += childNodes[i].textContent.trim() + ' ';
	// 						}
	// 					}

	// 					selectionObject = {
	// 						selection: selection.toString(),
	// 						from: from,
	// 						to: to,
	// 						sentence: sentence
	// 					};

	// 					return selectionObject;
	// 				};

	// 				hideModal = function () {
	// 					if (typeof responseToTranslation === 'function') {
	// 						responseToTranslation({
	// 							store: true,
	// 							translation: selectedVocable.translation
	// 						});
	// 					}
	// 					scope.modalDisplayed = false;
	// 					scope.$apply();
	// 				};

	// 				//
	// 				// Event listener
	// 				//
	// 				chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	// 					if (message.type === 'GET-SELECTION') {
	// 						return sendResponse(getSelection());
	// 					} else if (message.type === 'TRANSLATION') {
	// 						scope.translationObject = message.translationObject;
	// 						scope.fromLang = message.translationObject.sourceLanguage;
	// 						selectedVocable = {
	// 							section: message.translationObject.sections[0].name,
	// 							translation: message.translationObject.sections[0].translations[0]
	// 						};
	// 						DisplayService.showOverlay();
	// 						DisplayService.registerHideModalCallback(hideModal);

	// 						scope.modalDisplayed = true;
	// 						scope.$apply();

	// 						responseToTranslation = sendResponse;
	// 					}
	// 					return true;
	// 				});

	// 				//
	// 				// Entry point
	// 				//
	// 				scope.init();
	// 			},
	// 			template:	'<div class="fvad-box" ng-show="modalDisplayed">' +
	// 							'<div class="fvad-title">' +
	// 								'<div class="fvad-vocable">{{ translationObject.v }}</div>' +
	// 								'<div>' +
	// 									'<span language-selector="fromLanguageSelected(language)" selection="fromLang"></span> &gt; ' +
	// 									'<span language-selector="toLanguageSelected(language)" selection="toLang"></span>' +
	// 								'</div>' +
	// 							'</div>' +
	// 							'<section class="fvad-vocable-section" ng-repeat="section in translationObject.sections">' +
	// 								'<p class="fvad-section-name">{{ section.name }}</p>' +
	// 								'<ul>' +
	// 									'<li ng-repeat="t in section.translations" ng-click="changeSelectedVocable(section.name, t)">{{ t }} <span class="fvad-comment" ng-show="isSelected(section.name, t)">(will be added to trainer)</span></li>' +
	// 								'</ul>' +
	// 							'</section>' +
	// 							'<div class="fvad-button-area">' +
	// 								'<button class="fvad-button fvad-dont-add-button" ng-click="dontAddTranslation()">Don\'t add vocable to training</button>' +
	// 							'</div>' +
	// 						'</div>'
	// 		};
	// 	}
	// ]);

	// if (document.contentType === 'text/html') {
	// 	// entry point
	// 	fvad.appendChild(elOverlay);
	// 	fvad.appendChild(el);
	// 	document.body.appendChild(fvad);

	// 	// bootstrapping angular
	// 	angular.bootstrap(fvad, ['fvad-app-modal']);
	// }

	// ------------------------------------------
	// Helper functions
	// ------------------------------------------
	var stripTrash = function (input) {
		return input.replace('»', '')
					.replace('(', '')
					.replace(')', '')
					.trim();
	};

	var registerClickListener = function (element, srcTranslation, destTranslation, sentence) {
		element.onclick = function () {
			var message = {
				type: 'ADD-TRANSLATION',
				vocable: srcTranslation,
				translation: destTranslation,
				sentence: sentence,
				sourceLanguage: 'da'
			};
			chrome.runtime.sendMessage(message, function () {
				console.log(message);
				element.innerHTML = 'vocable added!';
				element.className = 'fvad-done';
				element.onclick = null;
			});
		};
	};

	if (document.location.href.indexOf('www.ordbogen.com') >= 0) {
		console.log('we are here!');
		var results = document.querySelectorAll('[name="searchArticleResult"] li');
		for (var i = 0; i < results.length; i++) {
			var result = results[i];

			var danishPhrase,
				translatedPhrase,
				sentence = '',
				a;

			a = document.createElement('a');
			a.className = 'fvad-add-button';
			a.innerHTML = 'Add to 50vad!';

			if (result.children[0].tagName === 'SPAN' && result.children[0].className !== 'explanation' && result.children[1].tagName === 'INPUT') {
				danishPhrase = stripTrash(result.children[0].innerText);
				translatedPhrase = stripTrash(result.children[1].value);
				
				registerClickListener(a, danishPhrase, translatedPhrase, sentence);
				result.insertBefore(a, result.children[2]);
			}
			else if (result.children[0].tagName === 'INPUT') {
				danishPhrase = stripTrash(result.parentElement.parentElement.parentElement.parentElement.parentElement.childNodes[0].querySelector('input').value);
				translatedPhrase = stripTrash(result.children[0].value);

				registerClickListener(a, danishPhrase, translatedPhrase, sentence);
				result.insertBefore(a, result.children[1]);
			}
			else if (result.children[0].className === 'explanation') {
				danishPhrase = stripTrash(result.parentElement.parentElement.parentElement.parentElement.parentElement.childNodes[0].querySelector('input').value);
				translatedPhrase = stripTrash(result.children[1].value);

				registerClickListener(a, danishPhrase, translatedPhrase, sentence);
				result.insertBefore(a, result.children[2]);
			}
		}
	}
})(/*window.angular*/);