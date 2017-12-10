(function() {
  'use strict'

  angular.module('pogoApp').controller('AdvancedController', AdvancedController);

  AdvancedController.$inject = ['$http', '$route', 'gameData'];

  function AdvancedController($http, $route, gameData, ngMeta) {
    var vm = this;

    vm.baseData = { imgIndex: '000' };
    vm.pokemonData = {};
    vm.evoData = {};

    vm.gameData = gameData;
    vm.prepareData = prepareData;
    vm.getEvoHP = getEvoHP;
    vm.getEvoCP = getEvoCP;
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
        try {
            var arrayData = JSON.parse(atob(decodeURIComponent(uriData)));

            vm.baseData = {
              number: arrayData[0],
              cp: arrayData[1],
              hp: arrayData[2],
              ATK_IV: arrayData[3],
              DEF_IV: arrayData[4],
              HP_IV: arrayData[5],
              level: arrayData[6],
              imgIndex: (arrayData[0] < 100) ? '00' + (arrayData[0]) : ((arrayData[0] < 100) ? '0' + (arrayData[0]) : (arrayData[0])),
              fullData: true
            };
        } catch (e) {
          for (var num = 0; num < vm.gameData.pokemonList.length; num++) {
            if (uriData.toLocaleLowerCase() === vm.gameData.pokemonList[num].name.toLocaleLowerCase()) {
              break;
            }
          }

          if (num < vm.gameData.pokemonList.length) {
            vm.baseData = {
              number: num,
              ATK_IV: 15,
              DEF_IV: 15,
              HP_IV: 15,
              imgIndex: (num < 9) ? '00' + (num + 1) : ((num < 99) ? '0' + (num + 1) : (num + 1))
            };
          }
        }
      } else {
        var num = parseInt(uriData);
        if (num < vm.gameData.pokemonList.length) {
          vm.baseData = {
            number: num,
            ATK_IV: 15,
            DEF_IV: 15,
            HP_IV: 15,
            imgIndex: (num < 10) ? '00' + (num) : ((num < 100) ? '0' + (num) : (num))
          };
        }
      }

      if (vm.baseData.imgIndex != '000') {
        // Prepare PokemonData
        vm.pokemonData = vm.gameData.pokemonData[vm.baseData.number];
        vm.pokemonData.name = vm.gameData.pokemonList[vm.baseData.number - 1].name;

        for (var num = 0; num < vm.pokemonData.MOVESET.BASIC.length; num++) {
          var basic = vm.pokemonData.MOVESET.BASIC[num];
          vm.pokemonData.MOVESET.BASIC[num] = vm.gameData.moveList.BASIC[basic];
        }
        for (var num = 0; num < vm.pokemonData.MOVESET.CHARGE.length; num++) {
          var charge = vm.pokemonData.MOVESET.CHARGE[num];
          vm.pokemonData.MOVESET.CHARGE[num] = vm.gameData.moveList.CHARGE[charge];
        }

        for (var num = 0; num < vm.pokemonData.LEGACY.BASIC.length; num++) {
          var basic = vm.pokemonData.LEGACY.BASIC[num];
          vm.pokemonData.LEGACY.BASIC[num] = vm.gameData.moveList.BASIC[basic];
        }
        for (var num = 0; num < vm.pokemonData.LEGACY.CHARGE.length; num++) {
          var charge = vm.pokemonData.LEGACY.CHARGE[num];
          vm.pokemonData.LEGACY.CHARGE[num] = vm.gameData.moveList.CHARGE[charge];
        }

        // Prepare EvoData (if EVO)
        if ((vm.pokemonData.EVO) && (vm.pokemonData.EVO.length > 0)) {
          vm.evoData = [];
          getEvoData(vm.pokemonData.EVO);
        } else {
          vm.evoData = null;
        }

        $("meta[property='og\\:title']").attr('content', 'PoGOBin - Advanced Data for ' + vm.pokemonData.name);
        $("meta[property='og\\:image']").attr('content', 'http://pogo.trashbin.com.br/assets/img/sprites/' + vm.baseData.imgIndex + 'MS.png');
        var description = '';
        if (vm.fullData) {
          description += 'HP ' + vm.baseData.hp + ' | CP ' + vm.baseData.cp + '\n';
          description += 'IVs[HP-ATK-DEF] ' + vm.baseData.HP_IV + ' ' + vm.baseData.ATK_IV + ' ' + vm.baseData.DEF_IV + ' ' + '\n';
          for (var i = 0; i < vm.evoData.length; i++) {
            description += 'Evolved (' + vm.evoData[i].name + ') HP ' + vm.getEvoHP(i) + ' | CP ' + vm.getEvoCP(i) + '\n';
          }
        }
        description += 'Max HP ' + vm.getMaxHP()+ ' | Max CP ' + vm.getMaxCP() + '\n';
        for (var i = 0; i < vm.evoData.length; i++) {
          description += 'Evolved (' + vm.evoData[i].name + ') Max HP ' + vm.getEvoMaxHP(i) + ' | Max CP ' + vm.getEvoMaxCP(i) + '\n';
        }
        description = description.slice(0, description.lastIndexOf('\n'));
        $("meta[property='og\\:description']").attr('content', description);
      }
    }

    function getEvoData(EVO) {
      for (var i = 0; i < EVO.length; i++) {
          var evoNumber = EVO[i];
          var evoData = vm.gameData.pokemonData[evoNumber];
          evoData.name = vm.gameData.pokemonList[evoNumber-1].name;

          for (var j = 0; j < evoData.MOVESET.BASIC.length; j++) {
            var basic = evoData.MOVESET.BASIC[j];
            evoData.MOVESET.BASIC[j] = vm.gameData.moveList.BASIC[basic];
          }
          for (var j = 0; j < evoData.MOVESET.CHARGE.length; j++) {
            var charge = evoData.MOVESET.CHARGE[j];
            evoData.MOVESET.CHARGE[j] = vm.gameData.moveList.CHARGE[charge];
          }

          for (var j = 0; j < evoData.LEGACY.BASIC.length; j++) {
            var basic = evoData.LEGACY.BASIC[j];
            evoData.LEGACY.BASIC[j] = vm.gameData.moveList.BASIC[basic];
          }
          for (var j = 0; j < evoData.LEGACY.CHARGE.length; j++) {
            var charge = evoData.LEGACY.CHARGE[j];
            evoData.LEGACY.CHARGE[j] = vm.gameData.moveList.CHARGE[charge];
          }
          vm.evoData.push(evoData);
          if ((evoData.EVO) && (evoData.EVO.length > 0)) {
            getEvoData(evoData.EVO);
          }
      }
    }

    function getEvoHP(i) {
      if ((vm.gameData) && (vm.evoData) && (vm.baseData.level)) {
        var ECpM = vm.gameData.getECpM(vm.baseData.level);
        return Math.floor(ECpM * (vm.evoData[i].BHP + vm.baseData.HP_IV));
      }
      return '';
    }

    function getEvoCP(i) {
      if ((vm.gameData) && (vm.evoData) && (vm.baseData.level)) {
        var ECpM = vm.gameData.getECpM(vm.baseData.level);
        return Math.floor((vm.evoData[i].BATK + vm.baseData.ATK_IV) * Math.pow(vm.evoData[i].BDEF + vm.baseData.DEF_IV, 0.5) *
               Math.pow(vm.evoData[i].BHP + vm.baseData.HP_IV, 0.5) * Math.pow(ECpM, 2) / 10);
      }
      return '';
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

    function getEvoMaxHP(i) {
      if ((vm.gameData) && (vm.evoData)) {
        var ECpM = vm.gameData.getECpM(39);
        return Math.floor(ECpM * (vm.evoData[i].BHP + vm.baseData.HP_IV));
      }
      return '';
    }

    function getEvoMaxCP(i) {
      if ((vm.gameData) && (vm.evoData)) {
        var ECpM = vm.gameData.getECpM(39);
        return Math.floor((vm.evoData[i].BATK + vm.baseData.ATK_IV) * Math.pow(vm.evoData[i].BDEF + vm.baseData.DEF_IV, 0.5) *
               Math.pow(vm.evoData[i].BHP + vm.baseData.HP_IV, 0.5) * Math.pow(ECpM, 2) / 10);
      }
      return '';
    }

    function getNumBars(ENERGY) {
      var a = new Array(Math.floor(100 / ENERGY));
      return a;
    }
  }
})();
