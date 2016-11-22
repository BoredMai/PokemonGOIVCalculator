(function() {
  'use strict'

  angular.module('pogoApp').service('calcData', calcData);

  calcData.$inject = ['$http', '$location', 'gameData'];

  function calcData($http, $location, gameData) {
    var gameData = gameData;

    var service = {
      results: {},
      isCalculating: false,

      calculate: calculate,
      refine: refine
    }
    return service;

    function calculate(pokemonName, pokemon, cp, hp, isPoweredUp, factor, minLevel, overall, stats, highHP, highATK, highDEF) {
      service.results = {
        name: pokemonName,
        data: pokemon,
        cp: cp,
        hp: hp,
        isPoweredUp: isPoweredUp,
        refine: false,
        minIV: 45,
        avgIV: 0,
        maxIV: 0,
        stats: []
      };
      service.isCalculating = true;
      for (var i = minLevel; i <= minLevel + 1.5; i = i + factor) {
        var LVL = i + 1;
        var ECpM = gameData.getECpM(i);
        for (var HP = 0; HP < 16; HP++) {
          var THP = Math.floor(ECpM * (pokemon.BHP + HP));
          THP = THP < 10 ? 10 : THP;
          if (THP == hp) {
            for (var ATK = 0; ATK < 16; ATK++) {
              for (var DEF = 0; DEF < 16; DEF++) {
                var CP = Math.floor((pokemon.BATK + ATK) * Math.pow(pokemon.BDEF + DEF, 0.5) *
                         Math.pow(pokemon.BHP + HP, 0.5) * Math.pow(ECpM, 2) / 10);
                CP = CP < 10 ? 10 : CP;
                if (CP == cp) {
                  var result = {
                    level: LVL,
                    HP: HP,
                    ATK: ATK,
                    DEF: DEF,
                    total: HP + ATK + DEF
                  };
                  var accept = true;

                  //Check Leader Feedback
                  if (overall) {
                    if ((overall.min <= result.total) && (result.total <= overall.max)) {
                      if (stats) {
                        if (highHP) {
                          if ((result.HP < result.ATK) || (result.HP < result.DEF)) {
                            accept = false;
                          }
                          if ((result.HP == result.ATK) && (!highATK)) {
                            accept = false;
                          }
                          if ((result.HP == result.DEF) && (!highDEF)) {
                            accept = false;
                          }
                          if ((result.HP < stats.min) || (stats.max < result.HP)) {
                            accept = false;
                          }
                        }
                        if (highATK) {
                          if ((result.ATK < result.HP) || (result.ATK < result.DEF)) {
                            accept = false;
                          }
                          if ((result.ATK == result.HP) && (!highHP)) {
                            accept = false;
                          }
                          if ((result.ATK == result.DEF) && (!highDEF)) {
                            accept = false;
                          }
                          if ((result.ATK < stats.min) || (stats.max < result.ATK)) {
                            accept = false;
                          }
                        }
                        if (highDEF) {
                          if ((result.DEF < result.ATK) || (result.DEF < result.HP)) {
                            accept = false;
                          }
                          if ((result.DEF == result.HP) && (!highHP)) {
                            accept = false;
                          }
                          if ((result.DEF == result.ATK) && (!highATK)) {
                            accept = false;
                          }
                          if ((result.DEF < stats.min) || (stats.max < result.DEF)) {
                            accept = false;
                          }
                        }
                      }
                    } else {
                      accept = false;
                    }
                  }

                  if (accept) {
                    if (service.results.minIV > result.total) {
                      service.results.minIV = result.total;
                    }
                    if (service.results.maxIV < result.total) {
                      service.results.maxIV = result.total;
                    }
                    service.results.avgIV = (service.results.minIV + service.results.maxIV) / 2;
                    service.results.stats.push(result);
                  }
                }
              }
            }
          }
        }
      }
      service.isCalculating = false;
    }

    function refine(pokemonName, pokemon, refine) {
      var stats = service.results.stats;
      service.results = {
        name: pokemonName,
        data: pokemon,
        refine: true,
        minIV: 45,
        avgIV: 0,
        maxIV: 0,
        stats: []
      };

      for (var i = 0; i < stats.length; i++) {
        var factor = refine.isPoweredUp ? 0.5 : 1;
        var minLevel = refine.stardust * 2;
        var result = stats[i];
        for (var j = minLevel; j <= minLevel + 1.5; j = j + factor) {
          var ECpM = gameData.getECpM(j);
          var HP = Math.floor(ECpM * (pokemon.BHP + result.HP));
          var CP = Math.floor((pokemon.BATK + result.ATK) * Math.pow(pokemon.BDEF + result.DEF, 0.5) *
                   Math.pow(pokemon.BHP + result.HP, 0.5) * Math.pow(ECpM, 2) / 10);
          if ((CP == refine.cp) && (HP == refine.hp)) {
            if (service.results.minIV > result.total) {
              service.results.minIV = result.total;
            }
            if (service.results.maxIV < result.total) {
              service.results.maxIV = result.total;
            }
            service.results.avgIV = (service.results.minIV + service.results.maxIV) / 2;
            service.results.stats.push(result);
          }


        }
      }
    }
  }
})();
