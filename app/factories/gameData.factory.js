(function() {
  'use strict'

  angular.module('pogoApp').service('gameData', gameData);

  gameData.$inject = ['$http', '$location'];

  function gameData($http, $location) {
    var service = {
      pokemonList: [],
      pokemonData: [],
      moveList: {},
      cpm: {},
      dustValues: {},
      teams: {},
      fetchData: fetchData,
      fetchMoves: fetchMoves,
      fetchLanguage: fetchLanguage,
      getECpM: getECpM,
      language: undefined
    }
    return service;

    function fetchData() {
      return $http.get('assets/data/data.json').then(response => {
        if (response.status == 200) {
          service.cpm = response.data.cpm;
          service.dustValues = response.data.dustValues;
          service.pokemonData = response.data.pokemonData;
        }
        return service;
      });
    }

    function fetchMoves() {
      return $http.get('assets/data/moves.json').then(response => {
        if (response.status == 200) {
          service.moveList = response.data;
        return service;
        }
      });
    }

    function fetchLanguage() {
      service.language = Cookies.get('language');
      if (service.language == undefined) {
        service.language = 'en';
        Cookies.set('language', 'en');
      }
      return $http.get('assets/data/languages/' + service.language + '.json').then(response => {
        if (response.status == 200) {
          service.teams = response.data.teams;
          service.pokemonList = response.data.pokemonList;
        }
        return service;
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
