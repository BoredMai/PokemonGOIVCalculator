(function() {
  'use strict'

  angular.module('pogoApp').controller('CalcController', CalcController);

  CalcController.$inject = ['$http', '$interpolate', '$route', 'gameData'];

  function CalcController($http, $interpolate, $route, gameData) {
    var vm = this;

    vm.language = Cookies.get('language');
    vm.collapseInstructions = true;
    vm.pokemonName = '';
    vm.mouseOverDropdown = false;
    vm.isPoweredUp = false;
    vm.selectedTeam = null;
    vm.orderParams = 'total';
    vm.reverseResults = true;
    vm.backgroundImg = '000';
    vm.refine = {}

    vm.gameData = gameData;
    vm.switchLanguage = switchLanguage;
    vm.filterList = filterList;
    vm.focusItem = focusItem;
    vm.checkDropdownNavigation = checkDropdownNavigation;
    vm.checkPokemonName = checkPokemonName;
    vm.selectPokemon = selectPokemon;
    vm.toggleCheck = toggleCheck;
    vm.selectTeam = selectTeam;
    vm.disableCalc = disableCalc;
    vm.calculateIV = calculateIV;
    vm.showRefine = showRefine;
    vm.disableRefine = disableRefine;
    vm.addEvolutionsToRefineList = addEvolutionsToRefineList;
    vm.setRefineDustValues = setRefineDustValues;
    vm.refineIV = refineIV;
    vm.setOrderByParams = setOrderByParams;
    vm.exportData = exportData;

    activate();

    function activate() {
      gameData.fetchData();
      gameData.fetchLanguage();
    }

    function switchLanguage(language) {
      Cookies.set('language', language);
      $route.reload();
    };

    function filterList() {
      vm.filteredList = [];
      for (var i = 0; i < gameData.pokemonList.length; i++) {
        var name = gameData.pokemonList[i].name.toLowerCase();
        if (name.indexOf(vm.pokemonName.toLowerCase()) != -1) {
          vm.filteredList.push(gameData.pokemonList[i]);
        }
      }
      vm.pokemonInputChanged = true;
    }

    function focusItem(index) {
      vm.focusedItem = index;
      vm.pokemonName = vm.filteredList[vm.focusedItem].name;
    }

    function checkDropdownNavigation(event) {
      var pokemonObj;
      if (event.key == "ArrowDown") {
        vm.focusedItem++;
        if (vm.focusedItem == vm.filteredList.length) {
          vm.focusedItem = 0;
        }
        pokemonObj = vm.filteredList[vm.focusedItem];
        vm.pokemonName = pokemonObj.name;
        event.preventDefault();
      } else if (event.key == "ArrowUp") {
        vm.focusedItem--;
        if (vm.focusedItem == -1) {
          vm.focusedItem = vm.filteredList.length - 1;
        }
        pokemonObj = vm.filteredList[vm.focusedItem];
        vm.pokemonName = pokemonObj.name;
        event.preventDefault();
      } else if (event.key == "Enter") {
        if (vm.filteredList.length > 0) {
          if (vm.focusedItem == -1) {
            vm.focusedItem = 0;
          }
          selectPokemon(vm.filteredList[vm.focusedItem]);
        } else {
          vm.pokemonName = '';
          vm.pokemonInputChanged = false;
          vm.mouseOverDropdown = false;
        }
      }
    }

    function checkPokemonName() {
      if (!vm.mouseOverDropdown) {
        vm.pokemon = null;
        if ((vm.pokemonName != '') && (vm.filteredList.length > 0)) {
          if (vm.focusedItem == -1) {
            vm.focusedItem = 0;
          }
          vm.selectPokemon(vm.filteredList[vm.focusedItem]);
        }
        if (!vm.pokemon) {
            vm.pokemonName = '';
            vm.pokemonInputChanged = false;
            vm.mouseOverDropdown = false;
            vm.backgroundImg = '000';
        }
      }
    }

    function selectPokemon(pokemon) {
      vm.pokemon = gameData.pokemonData[pokemon.number];
      vm.pokemonName = pokemon.name;
      vm.pokemonInputChanged = false;
      vm.mouseOverDropdown = false;
      vm.backgroundImg = (pokemon.number < 9) ? '00' + (pokemon.number + 1) : ((pokemon.number < 99) ? '0' + (pokemon.number + 1) : (pokemon.number + 1));

      vm.refine.pokemonList = [];
      vm.addEvolutionsToRefineList(pokemon, vm.pokemon);
    };

    function toggleCheck(check) {
      vm[check] = !vm[check];
    };

    function selectTeam(team) {
      if (vm.selectedTeam == gameData.teams[team]) {
        vm.selectedTeam = null;
      } else {
        vm.selectedTeam = gameData.teams[team];
      }
    };

    function disableCalc() {
      if ((vm.pokemon) && (vm.cp) && (vm.hp) && (vm.stardust)) {
        return false;
      }
      return true;
    }

    function calculateIV() {
      vm.results = {
        name: vm.pokemonName,
        data: vm.pokemon,
        cp: vm.cp,
        hp: vm.hp,
        isPoweredUp: vm.isPoweredUp,
        minIV: 45,
        avgIV: 0,
        maxIV: 0,
        stats: []
      };
      var factor = vm.isPoweredUp ? 0.5 : 1;
      var minLevel = vm.stardust * 2;
      for (var i = minLevel; i <= minLevel + 1.5; i = i + factor) {
        var LVL = i + 1;
        var ECpM = gameData.getECpM(i);
        for (var HP = 0; HP < 16; HP++) {
          var THP = Math.floor(ECpM * (vm.pokemon.BHP + HP));
          THP = THP < 10 ? 10 : THP;

          if (THP == vm.hp) {
            for (var ATK = 0; ATK < 16; ATK++) {
              for (var DEF = 0; DEF < 16; DEF++) {
                var CP = Math.floor((vm.pokemon.BATK + ATK) * Math.pow(vm.pokemon.BDEF + DEF, 0.5) *
                         Math.pow(vm.pokemon.BHP + HP, 0.5) * Math.pow(ECpM, 2) / 10);
                CP = CP < 10 ? 10 : CP;
                if (CP == vm.cp) {
                  var result = {
                    level: LVL,
                    HP: HP,
                    ATK: ATK,
                    DEF: DEF,
                    total: HP + ATK + DEF
                  };
                  var accept = true;

                  //Check Leader Feedback
                  if (vm.overall) {
                    if ((vm.overall.min <= result.total) && (result.total <= vm.overall.max)) {
                      if (vm.stats) {
                        if (vm.highHP) {
                          if ((result.HP < result.ATK) || (result.HP < result.DEF)) {
                            accept = false;
                          }
                          if ((result.HP == result.ATK) && (!vm.highATK)) {
                            accept = false;
                          }
                          if ((result.HP == result.DEF) && (!vm.highDEF)) {
                            accept = false;
                          }
                          if ((result.HP < vm.stats.min) || (vm.stats.max < result.HP)) {
                            accept = false;
                          }
                        }
                        if (vm.highATK) {
                          if ((result.ATK < result.HP) || (result.ATK < result.DEF)) {
                            accept = false;
                          }
                          if ((result.ATK == result.HP) && (!vm.highHP)) {
                            accept = false;
                          }
                          if ((result.ATK == result.DEF) && (!vm.highDEF)) {
                            accept = false;
                          }
                          if ((result.ATK < vm.stats.min) || (vm.stats.max < result.ATK)) {
                            accept = false;
                          }
                        }
                        if (vm.highDEF) {
                          if ((result.DEF < result.ATK) || (result.DEF < result.HP)) {
                            accept = false;
                          }
                          if ((result.DEF == result.HP) && (!vm.highHP)) {
                            accept = false;
                          }
                          if ((result.DEF == result.ATK) && (!vm.highATK)) {
                            accept = false;
                          }
                          if ((result.DEF < vm.stats.min) || (vm.stats.max < result.DEF)) {
                            accept = false;
                          }
                        }
                      }
                    } else {
                      accept = false;
                    }
                  }

                  if (accept) {
                    if (vm.results.minIV > result.total) {
                      vm.results.minIV = result.total;
                    }
                    if (vm.results.maxIV < result.total) {
                      vm.results.maxIV = result.total;
                    }
                    vm.results.avgIV = (vm.results.minIV + vm.results.maxIV) / 2;
                    vm.results.stats.push(result);
                  }
                }
              }
            }
          }
        }
      }
    };

    function showRefine() {
      if ((vm.results) && (vm.results.stats.length > 0) && (vm.pokemon == vm.results.data)) {
        return true;
      }

      return false;
    }

    function disableRefine() {
      if ((vm.refine.number) && (vm.refine.cp) && (vm.refine.hp) && (vm.refine.stardust)) {
        return false;
      }

      return true;
    }

    function addEvolutionsToRefineList(pokemonInfo, pokemonData) {
      if (pokemonData.EVO) {
        for (var i = 0; i < pokemonData.EVO.length; i++) {
          var EVO = pokemonData.EVO[i];
          vm.addEvolutionsToRefineList(gameData.pokemonList[EVO], gameData.pokemonData[EVO]);
        }
      }
      if (vm.refine.pokemonList.indexOf(pokemonInfo) == -1) {
        vm.refine.pokemonList.push(pokemonInfo)
      }
    }

    function setRefineDustValues() {
      vm.refine.dustValues = [parseInt(vm.stardust), parseInt(vm.stardust) + 1];
    }

    function refineIV() {
      var stats = vm.results.stats;
      var pokemon = gameData.pokemonData[vm.refine.number];
      vm.results = {
        name: gameData.pokemonList[vm.refine.number].name,
        data: pokemon,
        minIV: 45,
        avgIV: 0,
        maxIV: 0,
        stats: []
      };

      for (var i = 0; i < stats.length; i++) {
        var factor = vm.refine.isPoweredUp ? 0.5 : 1;
        var minLevel = vm.refine.stardust * 2;
        var result = stats[i];
        for (var j = minLevel; j <= minLevel + 1.5; j = j + factor) {
          var ECpM = gameData.getECpM(j);
          var HP = Math.floor(ECpM * (pokemon.BHP + result.HP));
          var CP = Math.floor((pokemon.BATK + result.ATK) * Math.pow(pokemon.BDEF + result.DEF, 0.5) *
                   Math.pow(pokemon.BHP + result.HP, 0.5) * Math.pow(ECpM, 2) / 10);
          if ((CP == vm.refine.cp) && (HP == vm.refine.hp)) {
            if (vm.results.minIV > result.total) {
              vm.results.minIV = result.total;
            }
            if (vm.results.maxIV < result.total) {
              vm.results.maxIV = result.total;
            }
            vm.results.avgIV = (vm.results.minIV + vm.results.maxIV) / 2;
            vm.results.stats.push(result);
          }
        }
      }
    }

    function exportData() {
        var data = {};
        data.pokemon = vm.pokemonName;
        data.cp = vm.cp;
        data.hp = vm.hp;
        data.stardust = vm.stardust;
        if (vm.selectedTeam) {
            data.team = vm.selectedTeam.name;
            if (vm.overall) {
                data.overall = vm.overall;
            }
            if (vm.stats) {
                data.stats = vm.stats;
            }
        }
        data.results = vm.results;
        var json = JSON.stringify(data);
        var file = new File([json], vm.pokemonName + ".json", {
            type: "application/json"
        });
        saveAs(file);
    };

    function setOrderByParams(params) {
        if (params == vm.orderParams) {
            vm.reverseResults = !vm.reverseResults;
        } else {
            vm.orderParams = params;
        }
    };

  }
})();
