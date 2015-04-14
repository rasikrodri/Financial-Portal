
/**
 *
 * alertsCtrl
 *
 */

angular
    .module('app')
    .controller('acccountconfirmedController', acccountconfirmedController)

function acccountconfirmedController($state, $scope, message) {

    $scope.result = message;
    $scope.Message = message;
    $scope.ToDo = '';

    $scope.Redirect = function (whaitFor) {
        setInterval(function () {
            $state.go('common.login');
        }, whaitFor);
    }

    //If user was activated then redirect to login state or log in automatically
    if (message === 'OK') {
        $scope.Message = 'Your account has been confirmed.'
        $scope.ToDo = 'You will be redirected to the login page in 10 seconds.';

        $scope.Redirect(10000);
    }
    else
    {
        //Otherwise simply display error message and send user to register state
        $scope.Message = 'ERROR';
        $scope.ToDo = 'An error occurred while trying to activate your account!\n' + 
            'The account may already have been activated.';        
    }
    
    
    
}