angular.module('pogoApp', ['ui.bootstrap', 'ngAnimate', 'ngRoute', 'ngMeta']);
angular.module('pogoApp').run(['ngMeta', function(ngMeta) {
    ngMeta.init();
}]);
