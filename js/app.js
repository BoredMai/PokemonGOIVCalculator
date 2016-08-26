angular.module('PoGOApp', ['ui.bootstrap', 'ngAnimate', 'PoGOCtrl']);

angular.module('PoGOCtrl', []).controller('PoGOController', ['$scope', '$http', '$interpolate', function($scope, $http, $interpolate) {

    $http.get('data/data.json').success(function(data) {
        $scope.language = "en";
        $scope.pokemonList = data.pokemonList;
        $scope.pokemonList.it = data.pokemonList.en;
        $scope.pokemonList.es = data.pokemonList.en;
        $scope.pokemonData = data.pokemonData;
        $scope.cpm = data.cpm;
        $scope.dustValues = data.dustValues;
    });

    $http.get('data/teams.json').success(function(data) {
        $scope.teams = data;
    });

    $scope.team = null;
    $scope.pokemonName = '';
    $scope.poweredup = false;
    $scope.mouseOverDropdown = false;
    $scope.collapseHelp = true;
    $scope.collapseChangelog = true;
    $scope.collapseCredits = true;
    $scope.orderParams = 'total';
    $scope.reverse = true;

    $scope.calculateIV = function() {
        if ($scope.pokemon && $scope.cp && $scope.hp && $scope.stardust) {
            $scope.results = { minIV: 45, avgIV: 0, maxIV: 0, stats: [] };
            var factor = $scope.poweredup ? 0.5 : 1;
            var minLevel = $scope.stardust * 2;
            for (var i = minLevel; i <= minLevel + 1.5; i = i + factor) {
                var LVL = i + 1;
                var ECpM = $scope.getECpM(i);
                for (var HP = 0; HP < 16; HP++) {
                    var THP = Math.floor(ECpM * ($scope.pokemon.BHP + HP));
                    THP = THP < 10 ? 10 : THP;
                    if (THP == $scope.hp) {
                        for (var ATK = 0; ATK < 16; ATK++) {
                            for (var DEF = 0; DEF < 16; DEF++) {
                                var CP = Math.floor(($scope.pokemon.BATK + ATK) * Math.pow($scope.pokemon.BDEF + DEF, 0.5)
                                        * Math.pow($scope.pokemon.BHP + HP, 0.5) * Math.pow(ECpM, 2) / 10);
                                CP = CP < 10 ? 10 : CP;
                                if (CP == $scope.cp) {
                                    var result = { level: LVL, HP: HP, ATK: ATK, DEF: DEF, total: HP+ATK+DEF };
                                    var accept = true;

                                    //Check Leader Feedback
                                    if ($scope.overall) {
                                        if (($scope.overall.min <= result.total) && (result.total <= $scope.overall.max)) {
                                            if ($scope.stats) {
                                                if ($scope.highHP) {
                                                    if ((result.HP < result.ATK) || (result.HP < result.DEF)) {
                                                        accept = false;
                                                    }
                                                    if ((result.HP == result.ATK) && (!$scope.highATK)) {
                                                        accept = false;
                                                    }
                                                    if ((result.HP == result.DEF) && (!$scope.highDEF)) {
                                                        accept = false;
                                                    }
                                                    if ((result.HP < $scope.stats.min) || ($scope.stats.max < result.HP)) {
                                                        accept = false;
                                                    }
                                                }
                                                if ($scope.highATK) {
                                                    if ((result.ATK < result.HP) || (result.ATK < result.DEF)) {
                                                        accept = false;
                                                    }
                                                    if ((result.ATK == result.HP) && (!$scope.highHP)) {
                                                        accept = false;
                                                    }
                                                    if ((result.ATK == result.DEF) && (!$scope.highDEF)) {
                                                        accept = false;
                                                    }
                                                    if ((result.ATK < $scope.stats.min) || ($scope.stats.max < result.ATK)) {
                                                        accept = false;
                                                    }
                                                }
                                                if ($scope.highDEF) {
                                                    if ((result.DEF < result.ATK) || (result.DEF < result.HP)) {
                                                        accept = false;
                                                    }
                                                    if ((result.DEF == result.HP) && (!$scope.highHP)) {
                                                        accept = false;
                                                    }
                                                    if ((result.DEF == result.ATK) && (!$scope.highATK)) {
                                                        accept = false;
                                                    }
                                                    if ((result.DEF < $scope.stats.min) || ($scope.stats.max < result.DEF)) {
                                                        accept = false;
                                                    }
                                                }
                                            }
                                        } else {
                                            accept = false;
                                        }
                                    }

                                    if (accept) {
                                        if ($scope.results.minIV > result.total) {
                                            $scope.results.minIV = result.total;
                                        }
                                        if ($scope.results.maxIV < result.total) {
                                            $scope.results.maxIV = result.total;
                                        }
                                        $scope.results.avgIV = ($scope.results.minIV + $scope.results.maxIV) / 2;
                                        $scope.results.stats.push(result);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    $scope.getECpM = function(level) {
        if ($scope.cpm) {
            if (level == Math.floor(level)) {
                return $scope.cpm[level];
            } else {
                return Math.sqrt((Math.pow($scope.cpm[Math.floor(level)], 2) + Math.pow($scope.cpm[Math.ceil(level)], 2)) / 2);
            }
        }
    };

    $scope.checkPokemonName = function() {
        if (!$scope.mouseOverDropdown) {
            $scope.pokemon = null;
            if ($scope.pokemonName != '') {
                for (var i = 0; i < $scope.pokemonList[$scope.language].length; i++) {
                    if ($scope.pokemonName.toLowerCase() === $scope.pokemonList[$scope.language][i].name.toLowerCase()) {
                        $scope.selectPokemon($scope.pokemonList[$scope.language][i]);
                    }
                }
            }
            if (!$scope.pokemon) {
                $scope.pokemonName = '';
                $scope.pokemonInputChanged = false;
                $scope.mouseOverDropdown = false;
            }
        }
    }

    $scope.selectPokemon = function(p) {
        $scope.pokemon = $scope.pokemonData[p.number];
        $scope.pokemonName = p.name;
        $scope.pokemonInputChanged = false;
        $scope.mouseOverDropdown = false;
    };

    $scope.selectTeam = function(team) {
        if ($scope.team == $scope.teams[$scope.language][team]) {
            $scope.team = null;
        } else {
            $scope.team = $scope.teams[$scope.language][team];
        }
    };

    $scope.clearTeam = function() {
        $scope.team = null;
        $scope.overall = null;
        $scope.stats = null;
        $scope.highHP = false;
        $scope.highATK = false;
        $scope.highDEF = false;
    };

    $scope.toggleCheck = function(check) {
        $scope[check] = !$scope[check];
    };

    $scope.exportData = function() {
        var data = {};
        data.pokemon = $scope.pokemonName;
        data.cp = $scope.cp;
        data.hp = $scope.hp;
        data.stardust = $scope.stardust;
        if ($scope.team) {
            data.team = $scope.team.name;
            if ($scope.overall) {
                data.overall = $scope.overall;
            }
            if ($scope.stats) {
                data.stats = $scope.stats;
            }
        }
        data.results = $scope.results;
        var json = JSON.stringify(data);
        var file = new File([json], $scope.pokemonName + ".json", {type: "application/json"});
        saveAs(file);
    };

    $scope.switchLanguage = function(language) {
        $scope.language = language;
        $scope.pokemon = null;
        $scope.pokemonName = '';
        $scope.team = null;
    };

    $scope.setOrderByParams = function(params) {
        if (params == $scope.orderParams) {
            $scope.reverse = !$scope.reverse;
        } else {
            $scope.orderParams = params;
        }
    };

    $scope.filterList = function() {
        $scope.filteredList = [];
        for (var i = 0; i < $scope.pokemonList[$scope.language].length; i++) {
            var name = $scope.pokemonList[$scope.language][i].name.toLowerCase();
            if (name.indexOf($scope.pokemonName.toLowerCase()) != -1) {
                $scope.filteredList.push($scope.pokemonList[$scope.language][i]);
            }
        }
        $scope.pokemonInputChanged = true;
    }

    $scope.checkDropdownNavigation = function(event) {
        if (event.key == "ArrowDown") {
            $scope.focusedItem++;
            if ($scope.focusedItem == $scope.filteredList.length) {
                $scope.focusedItem = 0;
            }
            pokemonObj = $scope.filteredList[$scope.focusedItem];
            $scope.pokemonName = pokemonObj.name;
            event.preventDefault();
        } else if (event.key == "ArrowUp") {
            $scope.focusedItem--;
            if ($scope.focusedItem == -1) {
                $scope.focusedItem = $scope.filteredList.length - 1;
            }
            pokemonObj = $scope.filteredList[$scope.focusedItem];
            $scope.pokemonName = pokemonObj.name;
            event.preventDefault();
        } else if (event.key == "Enter") {
            if ($scope.focusedItem > -1) {
                pokemonObj = $scope.filteredList[$scope.focusedItem];
                $scope.pokemon = $scope.pokemonData[pokemonObj.number];
                $scope.pokemonName = pokemonObj.name;
                $scope.pokemonInputChanged = false;
            }
        }
    };

    $scope.focusItem = function(index) {
        $scope.focusedItem = index;
        pokemonObj = $scope.filteredList[$scope.focusedItem];
        $scope.pokemonName = pokemonObj.name;
    }
}]);
