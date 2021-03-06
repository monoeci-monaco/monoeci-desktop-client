/* global $, angular, myApp */

myApp.controller("addEthAddressCtrl", [ '$rootScope', '$scope', '$window', 'FicIcoFactory', '$route', function( $rootScope, $scope ,  $window ,  FicIcoFactory, $route ) {

  $scope.eth_address = '';
  $scope.invalidEth = false;
  $scope.alreadyAdded = false;
  $scope.addressNotFound = false;
  $scope.noEthAddress = ( $window.localStorage[`whitelist`] ? false : true );
  $scope.currentEthAddressCoins = '';

  $scope.addEthAdrress = async (eth_address) => {
    $scope.invalidEth = false;
    $scope.alreadyAdded = false;
    $scope.addressNotFound = false;
    let allCoins = [];
    const newEthAddress = angular.copy(eth_address);
    const ficAddress = angular.copy($rootScope.address);
    const ficDistributor = angular.copy(FicIcoFactory.ficDistributorAddress);
    let currentAddresses = {};

    if (FicIcoFactory.web3.utils.isAddress(newEthAddress)) {
      const newCoins = await FicIcoFactory.getEthTokens(newEthAddress);

      if( (newCoins.total[0] + newCoins.total[90] + newCoins.total[180]) == 0 ) {
        $scope.addressNotFound = true;
        $scope.$apply();
        throw new Error('ETH address not found in whitelist');
      }

      if($window.localStorage[`whitelist`]) {
        // If there is something
        currentAddresses = JSON.parse($window.localStorage[`whitelist`]);

        if(currentAddresses[ficDistributor]) {
          // If there is something within current distributor
          if(currentAddresses[ficDistributor][ficAddress]) {
            allCoins = currentAddresses[ficDistributor][ficAddress];
          }
          const findIfExists = allCoins.filter(function(obj){ return obj.address == newEthAddress });
          if (findIfExists.length > 0) {
            $scope.alreadyAdded = true;
            $scope.$apply();
            throw new Error('ETH address already exists');
          }
          allCoins.push({address: newEthAddress, coins: newCoins});
          currentAddresses[ficDistributor][ficAddress] = allCoins;

        } else {
          // If new distributor, start everything all over
          allCoins.push({address: newEthAddress, coins: newCoins});
          let newRow = {
            [ficAddress]: allCoins
          }
          currentAddresses[ficDistributor] = newRow;
        }
      } else {
        // If nothing exists
        allCoins.push({address: newEthAddress, coins: newCoins});
        let newRow = {
          [ficAddress]: allCoins
        }
        currentAddresses[ficDistributor] = newRow;
      }
      $window.localStorage[`whitelist`] = JSON.stringify(currentAddresses);

      $('#addEthAddressModal').modal('toggle');
      $('#addEthAddressModal').on('hidden.bs.modal', function (e) {
        $route.reload();
      });

    } else {
      $scope.invalidEth = true;
      console.error('Invalid Ethereum address.');
    }
  }

}]);
