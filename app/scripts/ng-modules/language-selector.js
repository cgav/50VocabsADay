(function (angular) {
	'use strict';

	var app = angular.module('language-selector', []);

	app.directive('languageSelector', [function () {
		return {
			restrict: 'A',
			template:	'<select ng-change="changeSelection(selection)" ng-model="selection">' +
							'<option value="da">Danish</option>' +
							'<option value="de">German</option>' +
							'<option value="en">English</option>' +
							'<option value="es">Espa&#241;ol</option>' +
						'</select>',
			scope: {
				languageSelected: '&languageSelector',
				selection: '='
			},
			link: function (scope) {
				scope.changeSelection = function (selection) {
					console.log('scope.changeSelection called', selection);
					scope.languageSelected({
						language: selection
					});
				};
			}
		};
	}]);
})(window.angular);