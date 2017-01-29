angular.module('pogoApp').config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/calculator/', {
      templateUrl: 'app/components/calc/calc.view.html'
    })
    // .when('/calculator/advanced/', {
    //   templateUrl: 'app/components/advanced/advanced.view.html'
    // })
    .otherwise({ redirectTo: '/calculator'});
})
