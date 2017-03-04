(function() {
  'use strict'

  angular.module('pogoApp').controller('CalcController', CalcController);

  CalcController.$inject = ['$http', '$route', '$location', 'gameData', 'calcData'];
function CalcController($http, $route, $location, gameData, calcData) {
    var vm = this;

    vm.collapseInstructions = true;
    vm.pokemonIndex = -1;
    vm.pokemonName = '';
    vm.mouseOverDropdown = false;
    vm.isPoweredUp = false;
    vm.selectedTeam = null;
    vm.orderParams = 'total';
    vm.reverseResults = true;
    vm.backgroundImg = '000';
    vm.refine = {}
    vm.filteredList = [];
    vm.showAdvancedIndex = -1;
    vm.showLoader = true;

    vm.gameData = gameData;
    vm.calcData = calcData;
    vm.switchLanguage = switchLanguage;
    vm.filterList = filterList;
    vm.focusItem = focusItem;
    vm.checkDropdownNavigation = checkDropdownNavigation;
    vm.checkPokemonName = checkPokemonName;
    vm.selectPokemon = selectPokemon;
    vm.toggleCheck = toggleCheck;
    vm.checkKeyboard = checkKeyboard;
    vm.selectTeam = selectTeam;
    vm.teamKeyboard = teamKeyboard;
    vm.disableCalc = disableCalc;
    vm.calculateIV = calculateIV;
    vm.showRefine = showRefine;
    vm.disableRefine = disableRefine;
    vm.addEvolutionsToRefineList = addEvolutionsToRefineList;
    vm.setRefineDustValues = setRefineDustValues;
    vm.refineKeyboard = refineKeyboard;
    vm.refineIV = refineIV;
    vm.setOrderByParams = setOrderByParams;
    vm.exportData = exportData;
    vm.toggleRowAdvanced = toggleRowAdvanced;
    vm.showAdvanced = showAdvanced;
    vm.moreInfo = moreInfo;

    activate();

    function activate() {
      vm.gameData.fetchData()
      .then(() => {
        vm.gameData.fetchMoves()
        .then(() => {
          vm.gameData.fetchLanguage();
        }).then(() => {
          vm.calcData.results = {};
          vm.calcData.isCalculating = false;
          vm.showLoader = false
        });
      });
    }

    function switchLanguage(language) {
      Cookies.set('language', language);
      $route.reload();
    };

    function filterList() {
      vm.filteredList = [];
      for (var i = 0; i < vm.gameData.pokemonList.length; i++) {
        if (vm.gameData.pokemonData[i].ACTIVE) {
          var name = vm.gameData.pokemonList[i].name.toLowerCase();
          if (name.indexOf(vm.pokemonName.toLowerCase()) != -1) {
            vm.filteredList.push(vm.gameData.pokemonList[i]);
          }
        }
      }
      vm.pokemonInputChanged = true;
    }

    function focusItem(index) {
      vm.focusedItem = index;
      vm.pokemonName = vm.filteredList[vm.focusedItem].name;
    }

    function checkDropdownNavigation(event) {
      if (vm.filteredList.length > 0) {
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
            // selectPokemon(vm.filteredList[vm.focusedItem]);
          } else {
            vm.pokemonName = '';
            vm.pokemonInputChanged = false;
            vm.mouseOverDropdown = false;
          }
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
      if (vm.pokemonIndex != pokemon.number) {
        vm.pokemonIndex = pokemon.number;
        vm.pokemon = gameData.pokemonData[vm.pokemonIndex];
        vm.pokemonName = pokemon.name;
        vm.pokemonInputChanged = false;
        vm.mouseOverDropdown = false;
        vm.backgroundImg = (pokemon.number < 9) ? '00' + (pokemon.number + 1) : ((pokemon.number < 99) ? '0' + (pokemon.number + 1) : (pokemon.number + 1));

        //Clearing form
        vm.cp = null;
        vm.hp = null;
        vm.stardust = null;
        vm.overall = null;
        vm.stats = null;
        vm.highHP = false;
        vm.highATK = false;
        vm.highDEF = false;

        vm.refine.cp = null;
        vm.refine.hp = null;
        vm.refine.stardust = null;
        vm.refine.isPoweredUp = false;
        vm.refine.pokemonList = [];
        vm.addEvolutionsToRefineList(pokemon, vm.pokemon);
      }
    };

    function toggleCheck(check) {
      vm[check] = !vm[check];
    };

    function checkKeyboard(check, event) {
      if ((event.key == " ") || (event.key == "Enter")) {
        vm.toggleCheck(check);
      }
    }

    function selectTeam(team) {
      if (vm.selectedTeam == gameData.teams[team]) {
        vm.selectedTeam = null;
      } else {
        vm.selectedTeam = gameData.teams[team];
      }
    };

    function teamKeyboard(team, event) {
      if ((event.key == " ") || (event.key == "Enter")) {
        vm.selectTeam(team);
      }
    }

    function disableCalc() {
      if ((vm.pokemon) && (vm.cp) && (vm.hp) && (vm.stardust)) {
        return false;
      }
      return true;
    }

    function calculateIV() {
      if (!(vm.showRefine()) || !(vm.disableRefine())) {
        vm.collapseRefine = true;
      }
      var factor = vm.isPoweredUp ? 0.5 : 1;
      var minLevel = vm.stardust * 2;
      vm.calcData.calculate(vm.pokemonName, vm.pokemon, vm.cp, vm.hp, vm.isPoweredUp, factor,
                            minLevel, vm.overall, vm.stats, vm.highHP, vm.highATK, vm.highDEF);
    };

    function showRefine() {
      if ((vm.calcData.results.stats) && (vm.calcData.results.stats.length > 0) && (vm.pokemon == vm.calcData.results.data)) {
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
          if (gameData.pokemonData[EVO].ACTIVE) {
            vm.addEvolutionsToRefineList(gameData.pokemonList[EVO], gameData.pokemonData[EVO]);
          }
        }
      }
      if (vm.refine.pokemonList.indexOf(pokemonInfo) == -1) {
        vm.refine.pokemonList.push(pokemonInfo)
      }
    }

    function setRefineDustValues() {
      vm.refine.dustValues = [parseInt(vm.stardust), parseInt(vm.stardust) + 1];
    }

    function refineKeyboard(event) {
      if ((event.key == " ") || (event.key == "Enter")) {
        vm.refine.isPoweredUp = !vm.refine.isPoweredUp;
      }
    }

    function refineIV() {
      vm.selectPokemon(gameData.pokemonList[vm.refine.number]);
      vm.cp = vm.refine.cp;
      vm.hp = vm.refine.hp;
      vm.stardust = vm.refine.stardust;
      vm.isPoweredUp = vm.refine.isPoweredUp;

      vm.calcData.refine(vm.pokemonName, vm.pokemon, vm.refine);
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
        data.results = vm.calcData.results;
        var json = angular.toJson(data);
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

    function toggleRowAdvanced(index) {
      if (vm.showAdvancedIndex === index) {
        vm.showAdvancedIndex = -1;
      } else {
        vm.showAdvancedIndex = index;
      }
    }

    function showAdvanced(index) {
      // Pass minimal data to ensure small base64 string
      var baseDataObj = [vm.pokemonIndex, vm.calcData.results.cp, vm.calcData.results.hp,
                         vm.calcData.results.stats[index].ATK, vm.calcData.results.stats[index].DEF,
                         vm.calcData.results.stats[index].HP, vm.calcData.results.stats[index].level];
      var baseData = btoa(angular.toJson(baseDataObj));
      $location.path('/advanced/' + encodeURIComponent(baseData));
    }

    function moreInfo() {
      $location.path('/advanced/' + parseInt(vm.backgroundImg));
    }

  }
})();
