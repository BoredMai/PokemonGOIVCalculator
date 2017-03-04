angular.module('pogoApp').config(function($routeProvider, $locationProvider, ngMetaProvider) {
  $routeProvider
    .when('/calculator', {
      templateUrl: 'app/components/calc/calc.view.html',
      data: {
        meta: {
          'og:title': 'PoGOBin IV Calculator',
          'og:description': 'A Pokémon GO IV Calculator',
          'og:image': './assets/img/pokeball.png'
        }
      }
    })
    .when('/advanced/:baseData', {
      templateUrl: 'app/components/advanced/advanced.view.html',
      data: {
        meta: {
          'og:title': 'PoGOBin - Pokémon not found!',
          'og:description': 'Check the number or spelling and try again!',
          'og:image': './assets/img/sprites/000MS.png'
        }
      }
    })
    .otherwise({ redirectTo: '/calculator'});
}).run(['ngMeta', function(ngMeta) {
    ngMeta.init();
}]);
