
/**
 *
 * alertsCtrl
 *
 */

angular
    .module('app')
    .controller('householdaccountsCtrl', householdaccountsCtrl)

function householdaccountsCtrl($scope, sweetAlert, notify, $modal, $http, $interval, sharedDataSvc) {

    //while (sharedDataSvc.LogedUser == null) { }//Wait until the user info is loaded

    $scope.loading = { startAt: 0, max: 99, durationSeconds: 1 };
    sharedDataSvc.LoadingTimer($scope.loading);


    $scope.tableManager = sharedDataSvc.CreateATableManager($scope, sharedDataSvc.GetAccounts);//$scope.$new(true)//creates a separate scope
    //Load the items for the first time
    $scope.tableManager.$scope.Retrieve();
    
    
    

    $scope.createAccount = function () {
        sharedDataSvc.createAccountModal($scope.tableManager.$scope.Retrieve);
    }
    $scope.updateAccount = function (account) {
        sharedDataSvc.updateAccountModal(account)
    };


    $scope.deleteAccount = function (account) {
        sweetAlert.swal({
            title: "Are you sure?",
            text: "All the account's transactions will be deleted. \nYou will not be able to recover this account!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel this!",
            closeOnConfirm: false,
            closeOnCancel: true
        },
            function (isConfirm) {
                if (isConfirm) {
                    sharedDataSvc.DeleteAccount(account.Id).then(function (response) {
                        var index = $scope.tableManager.$scope.Items.indexOf(account);
                        if (index > -1) {
                            $scope.tableManager.$scope.Items.splice(index, 1);
                        }
                    });

                    $scope.tableManager.$scope.Retrieve();
                    sweetAlert.swal("Deleted!", "The Account has been deleted.", "success");
                } else {
                    //sweetAlert.swal("Cancelled", "Account delition canceled.", "error");
                }
            });
    }
}
