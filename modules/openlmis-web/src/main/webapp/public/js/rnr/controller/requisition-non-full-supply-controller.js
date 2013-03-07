function RequisitionNonFullSupplyController($scope, FacilityApprovedProducts, $routeParams, $location) {
  FacilityApprovedProducts.get({facilityId: $routeParams.facility, programId: $routeParams.program}, function (data) {
    $scope.nonFullSupplyProducts = data.nonFullSupplyProducts;

    var map = _.map($scope.nonFullSupplyProducts, function (facilitySupportedProduct) {
          return facilitySupportedProduct.programProduct.product.category;
        });

    $scope.nonFullSupplyProductsCategories = _.uniq(map, false, function (category) {
          return category.id;
        });
  });

  $scope.getId = function (prefix, parent) {
    return prefix + "_" + parent.$parent.$index;
  };

  $scope.addNonFullSupplyLineItem = function () {
    prepareNFSLineItemFields();
    var lineItem = new RnrLineItem($scope.newNonFullSupply, $scope.$parent.rnr, $scope.$parent.programRnrColumnList);

    $scope.$parent.rnr.nonFullSupplyLineItems.push(lineItem);
    lineItem.fillPacksToShipBasedOnCalculatedOrderQuantityOrQuantityRequested();
    $scope.facilityApprovedProduct = undefined;
    $scope.newNonFullSupply = undefined;
    updateNonFullSupplyProductsToDisplay();
    $scope.fillPagedGridData();
  };

  $scope.showAddNonFullSupplyModal = function () {
    updateNonFullSupplyProductsToDisplay();
    $scope.nonFullSupplyProductsModal = true;
    $scope.clearNonFullSupplyProductModalData();

  };

  $scope.clearNonFullSupplyProductModalData = function () {
    $scope.facilityApprovedProduct = undefined;
    $scope.newNonFullSupply = undefined;
  }

  $scope.labelForRnrColumn = function (columnName) {
    if ($scope.$parent.programRnrColumnList) return _.findWhere($scope.$parent.programRnrColumnList, {'name': columnName}).label + ":";
  };

  $scope.shouldDisableAddButton = function () {
    return !($scope.newNonFullSupply && $scope.newNonFullSupply.quantityRequested && $scope.newNonFullSupply.reasonForRequestedQuantity
        && $scope.facilityApprovedProduct);
  };

  function populateProductInformation() {
    var product = {};
    angular.copy($scope.facilityApprovedProduct.programProduct.product, product);
    $scope.newNonFullSupply.productCode = product.code;
    $scope.newNonFullSupply.product = (product.primaryName == null ? "" : (product.primaryName + " ")) +
        (product.form.code == null ? "" : (product.form.code + " ")) +
        (product.strength == null ? "" : (product.strength + " ")) +
        (product.dosageUnit.code == null ? "" : product.dosageUnit.code);
    $(['dosesPerDispensingUnit', 'packSize', 'roundToZero', 'packRoundingThreshold', 'dispensingUnit', 'fullSupply']).each(function (index, field) {
      $scope.newNonFullSupply[field] = product[field];
    });
    $scope.newNonFullSupply.maxMonthsOfStock = $scope.facilityApprovedProduct.maxMonthsOfStock;
    $scope.newNonFullSupply.dosesPerMonth = $scope.facilityApprovedProduct.programProduct.dosesPerMonth;
    $scope.newNonFullSupply.price = $scope.facilityApprovedProduct.programProduct.currentPrice;
  }

  function prepareNFSLineItemFields() {
    populateProductInformation();
    $(['quantityReceived', 'quantityDispensed', 'beginningBalance', 'stockInHand', 'totalLossesAndAdjustments', 'calculatedOrderQuantity', 'newPatientCount',
      'stockOutDays', 'normalizedConsumption', 'amc', 'maxStockQuantity']).each(function (index, field) {
          $scope.newNonFullSupply[field] = 0;
        });
    $scope.newNonFullSupply.rnrId = $scope.$parent.rnr.id;
  }

  function updateNonFullSupplyProductsToDisplay() {
    var usedNonFullSupplyProducts = _.pluck($scope.$parent.rnr.nonFullSupplyLineItems, 'productCode');
    $scope.nonFullSupplyProductsToDisplay = $.grep($scope.nonFullSupplyProducts, function (facilityApprovedProduct) {
      return $.inArray(facilityApprovedProduct.programProduct.product.code, usedNonFullSupplyProducts) == -1;
    });
  }
}
