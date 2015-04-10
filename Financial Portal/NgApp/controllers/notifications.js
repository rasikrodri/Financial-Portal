
/**
 *
 * alertsCtrl
 *
 */

angular
    .module('app')
    .controller('notificationsCtrl', notificationsCtrl)

function notificationsCtrl(sharedDataSvc, $state, authService) {//, budgetItems, categories) {

    var scope = this;

    this.User = authService.authentication;

    //Add the notification field
    authService.authentication.Notifications = [];

    //I have to replace this with signalr
    //Get notifications every five seconds
    this.GettingNotifications = false;
    setInterval(function () {
        if (typeof scope.User.UserName !== 'undefined') {
            if (scope.User.UserName !== '' && scope.GettingNotifications === false) {
                scope.GettingNotifications = true;
                sharedDataSvc.GetUserNotifications(scope.User.UserName).then(function (data) {
                    scope.User.Notifications = data;
                    scope.GettingNotifications = false;
                })
            }
        }
    }, 5000);


    this.WantToJoinHousehold = function (invitation) {
        var scope = this;
        sweetAlert.swal({
            title: "Are you sure you want to leave your household and join " + invitation.FromUser_Name + "'s household?",
            text: "If there are not more user in your current househorld all it's data will be deleted!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, join household!",
            cancelButtonText: "No, cancel this and delete invitation!",
            closeOnConfirm: false,
            closeOnCancel: true
        },
            function (isConfirm) {
                var scope = this;
                if (isConfirm) {
                    var invi = invitation;
                    sharedDataSvc.JoinInvitedHousehold(invitation.Id).then(function (response) {
                        for (var i = 0; i < $scope.User.Notifications.length; i++) {
                            if (scope.User.Notifications[i] === invi) {
                                scope.User.Notifications.splice(i, 1);
                                break;
                            }
                        }


                        sweetAlert.swal("Account Migrated!", "You heve joined " + invitation.FromUser_Name + " household!", "success");

                        $state.go($state.current, {}, { reload: true });

                    });
                } else {
                    sharedDataSvc.DeleteHouseholdInvitation(invitation.Id).then(function (response) {
                        for (var i = 0; i < scope.User.Notifications.length; i++) {
                            if (scope.User.Notifications[i] === invi) {
                                scope.User.Notifications.splice(i, 1);
                                break;
                            }
                        }

                        sweetAlert.swal("Canceled!", "Nothing changed, but the invitation from " + invitation.FromUser_Name + " has been deleted", "error");
                    });
                }
            });
    }
};