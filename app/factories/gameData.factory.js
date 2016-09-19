(function() {
  'use strict'

  angular.module('pogoApp').service('gameData', gameData);

  gameData.$inject = ['$http', '$location'];

  function gameData($http, $location) {
    var service = {
      pokemonList: {},
      pokemonData: {},
      cpm: {},
      dustValues: {},
      teams: {},
      fetchData: fetchData,
      fetchLanguage: fetchLanguage,
      getECpM: getECpM
    }
    return service;

    function fetchData() {
      $http.get('assets/data/data.json').then(function(response) {
        if (response.status == 200) {
          service.cpm = response.data.cpm;
          service.dustValues = response.data.dustValues;
          service.pokemonData = response.data.pokemonData;
        }
      });
    }

    function fetchLanguage() {
      var language = Cookies.get('language');
      if (language == undefined) {
        language = 'en';
      }
      return $http.get('assets/data/languages/' + language + '.json').then(function(response) {
        if (response.status == 200) {
          service.teams = response.data.teams;
          service.pokemonList = response.data.pokemonList;
        }
      });
    }

    function getECpM(level) {
      if (level == Math.floor(level)) {
          return service.cpm[level];
      } else {
          return Math.sqrt((Math.pow(service.cpm[Math.floor(level)], 2) + Math.pow(service.cpm[Math.ceil(level)], 2)) / 2);
      }
    }
  }
})();
