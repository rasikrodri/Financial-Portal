
/**
 *
 * alertsCtrl
 *
 */

angular
    .module('app')
    .controller('edit_user_InfoCtrl', edit_user_InfoCtrl)

function edit_user_InfoCtrl($scope,sweetAlert, sharedDataSvc, authService) {

    $scope.loading = { startAt: 0, max: 99, durationSeconds: 1 };
    sharedDataSvc.LoadingTimer($scope.loading);
    $scope.PageLoaded = false;

    this.model = {
        Name: authService.authentication.Name,
        UserName: authService.authentication.UserName,
        OldPassword: '',
        NewPassword: '',
        NewPasswordConfirmation: '',
        passwordchangemessage:''
    }


    $scope.PageLoaded = true;

    this.UpdateUserInfo = function () {
        var scope = this;
        sharedDataSvc.UpdateUserInfo(this.model).then(function (response) {

            authService.authentication.Name = scope.model.Name;

            sweetAlert.swal("Updated!", response, "success");
        });

    }

    this.ChangePassword = function () {
        var scope = this;
        scope.errors = {};

        sharedDataSvc.ChangePassword(this.model).success(function (response) {

            scope.model.OldPassword = '';
            scope.model.NewPassword = '';
            scope.model.NewPasswordConfirmation = '';

            sweetAlert.swal("Password Changed!", "The password has been changed.", "success");
        }).error(function (response) {

            scope.model.OldPassword = '';
            scope.model.NewPassword = '';
            scope.model.NewPasswordConfirmation = '';

            scope.errors = response.ModelState;
        });
    }
}
