(function() {
  'use strict'

  angular.module('pogoApp').controller('AdvancedController', AdvancedController);

  AdvancedController.$inject = ['$http', '$route', 'gameData'];

  function AdvancedController($http, $route, gameData) {
    var vm = this;

    vm.baseData = { imgIndex: '000' };
    vm.pokemonData = {};
    vm.evoData = {};

    vm.gameData = gameData;
    vm.prepareData = prepareData;
    vm.getMaxHP = getMaxHP;
    vm.getMaxCP = getMaxCP;
    vm.getEvoMaxHP = getEvoMaxHP;
    vm.getEvoMaxCP = getEvoMaxCP;
    vm.getNumBars = getNumBars;

    activate();

    function activate() {
      vm.gameData.fetchData()
      .then(() => {
        vm.gameData.fetchMoves()
        .then(() => {
          vm.gameData.fetchLanguage().then(() => {
            vm.showLoader = false;
            vm.prepareData();
          });
        });
      });
    }

    function prepareData() {
      var uriData = $route.current.params.baseData;
      if (isNaN(parseInt(uriData))) {
        var arrayData = JSON.parse(atob(decodeURIComponent(uriData)));

        vm.baseData = {
          number: arrayData[0],
          cp: arrayData[1],
          hp: arrayData[2],
          ATK_IV: arrayData[3],
          DEF_IV: arrayData[4],
          HP_IV: arrayData[5],
          level: arrayData[6],
          imgIndex: (arrayData[0] < 9) ? '00' + (arrayData[0] + 1) : ((arrayData[0] < 99) ? '0' + (arrayData[0] + 1) : (arrayData[0] + 1))
        };
      } else {
        var num = parseInt(uriData) - 1;
        vm.baseData = {
          number: num,
          ATK_IV: 15,
          DEF_IV: 15,
          HP_IV: 15,
          imgIndex: (num < 9) ? '00' + (num + 1) : ((num < 99) ? '0' + (num + 1) : (num + 1))
        };
      }        

      // Prepare PokemonData
      vm.pokemonData = vm.gameData.pokemonData[vm.baseData.number];
      vm.pokemonData.name = vm.gameData.pokemonList[vm.baseData.number].name;

      for (var i = 0; i < vm.pokemonData.MOVESET.BASIC.length; i++) {
        var basic = vm.pokemonData.MOVESET.BASIC[i];
        vm.pokemonData.MOVESET.BASIC[i] = vm.gameData.moveList.BASIC[basic];
      }
      for (var i = 0; i < vm.pokemonData.MOVESET.CHARGE.length; i++) {
        var charge = vm.pokemonData.MOVESET.CHARGE[i];
        vm.pokemonData.MOVESET.CHARGE[i] = vm.gameData.moveList.CHARGE[charge];
      }

      for (var i = 0; i < vm.pokemonData.LEGACY.BASIC.length; i++) {
        var basic = vm.pokemonData.LEGACY.BASIC[i];
        vm.pokemonData.LEGACY.BASIC[i] = vm.gameData.moveList.BASIC[basic];
      }
      for (var i = 0; i < vm.pokemonData.LEGACY.CHARGE.length; i++) {
        var charge = vm.pokemonData.LEGACY.CHARGE[i];
        vm.pokemonData.LEGACY.CHARGE[i] = vm.gameData.moveList.CHARGE[charge];
      }

      

      // Prepare EvoData (if EVO)
      if ((vm.pokemonData.EVO) && (vm.pokemonData.EVO.length > 0)) {
        var evoNumber = vm.pokemonData.EVO[vm.pokemonData.EVO.length - 1];
        vm.evoData = vm.gameData.pokemonData[evoNumber];
        vm.evoData.name = vm.gameData.pokemonList[evoNumber].name;

        for (var i = 0; i < vm.evoData.MOVESET.BASIC.length; i++) {
          var basic = vm.evoData.MOVESET.BASIC[i];
          vm.evoData.MOVESET.BASIC[i] = vm.gameData.moveList.BASIC[basic];
        }
        for (var i = 0; i < vm.evoData.MOVESET.CHARGE.length; i++) {
          var charge = vm.evoData.MOVESET.CHARGE[i];
          vm.evoData.MOVESET.CHARGE[i] = vm.gameData.moveList.CHARGE[charge];
        }

        for (var i = 0; i < vm.evoData.LEGACY.BASIC.length; i++) {
          var basic = vm.evoData.LEGACY.BASIC[i];
          vm.evoData.LEGACY.BASIC[i] = vm.gameData.moveList.BASIC[basic];
        }
        for (var i = 0; i < vm.evoData.LEGACY.CHARGE.length; i++) {
          var charge = vm.evoData.LEGACY.CHARGE[i];
          vm.evoData.LEGACY.CHARGE[i] = vm.gameData.moveList.CHARGE[charge];
        }
      } else {
        vm.evoData = null;
      }
    }

    function getMaxHP() {
      if ((vm.gameData) && (vm.pokemonData)) {
        var ECpM = vm.gameData.getECpM(39);
        return Math.floor(ECpM * (vm.pokemonData.BHP + vm.baseData.HP_IV));
      }
      return '';
    }

    function getMaxCP() {
      if ((vm.gameData) && (vm.pokemonData)) {
        var ECpM = vm.gameData.getECpM(39);
        return Math.floor((vm.pokemonData.BATK + vm.baseData.ATK_IV) * Math.pow(vm.pokemonData.BDEF + vm.baseData.DEF_IV, 0.5) *
               Math.pow(vm.pokemonData.BHP + vm.baseData.HP_IV, 0.5) * Math.pow(ECpM, 2) / 10);
      }
      return '';
    }

    function getEvoMaxHP() {
      if ((vm.gameData) && (vm.evoData)) {
        var ECpM = vm.gameData.getECpM(39);
        return Math.floor(ECpM * (vm.evoData.BHP + vm.baseData.HP_IV));
      }
      return '';
    }

    function getEvoMaxCP() {
      if ((vm.gameData) && (vm.evoData)) {
        var ECpM = vm.gameData.getECpM(39);
        return Math.floor((vm.evoData.BATK + vm.baseData.ATK_IV) * Math.pow(vm.evoData.BDEF + vm.baseData.DEF_IV, 0.5) *
               Math.pow(vm.evoData.BHP + vm.baseData.HP_IV, 0.5) * Math.pow(ECpM, 2) / 10);
      }
      return '';
    }

    function getNumBars(ENERGY) {
      var a = new Array(Math.floor(100 / ENERGY));
      return a;
    }
  }
})();
