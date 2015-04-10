
/**
 *
 * alertsCtrl
 *
 */

angular
    .module('app')
    .controller('householdCtrl', householdCtrl)

function householdCtrl($scope, sweetAlert, notify, $modal, $http, $interval, sharedDataSvc, authService) {

    //this.LoggedUser = authService.authentication;
    $scope.loading = { startAt: 0, max: 99, durationSeconds: 1 };
    sharedDataSvc.LoadingTimer($scope.loading);
    $scope.PageLoaded = false;


    this.Household = [];
    this.totalUsers = 0;

    this.GetAllInfo = function () {
        var scope = this;
        sharedDataSvc.GetHousehold().then(function (data) {
            scope.Household = data;
            scope.totalUsers = scope.Household.Users.length;
            $scope.PageLoaded = true;
        })
    }

    this.GetAllInfo();

    this.UserToInvite = sharedDataSvc.CreateEmptyApplicationUser();
    this.SendInvitation = function () {
        var scope = this;

        if (scope.UserToInvite.UserName === '') {
            sweetAlert.swal("You must provide an email/username!", "", "warning");
        }
        else {
            sharedDataSvc.SendHouseholdInvitation(scope.UserToInvite).then(function (response) {
                if (response.Succeed === true) {
                    sweetAlert.swal("Invitation Sent!", response.Message, "success");
                    scope.UserToInvite.UserName = '';
                } else {
                    sweetAlert.swal("Error!", response.Message, "error");
                }                
            })
        }
    }
}
