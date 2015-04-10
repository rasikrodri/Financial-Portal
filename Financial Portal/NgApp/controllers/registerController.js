(function () {
    angular.module('app').controller('registerController', ['authService', '$timeout', '$state', 'sharedDataSvc', function (authService, $timeout, $state, sharedDataSvc) {


        this.savedSuccessfully = false;
        this.message = "Register a new account";
        this.errorsmessages = '';
        this.isError = false;

        this.model = {
            UserName: "",
            Name: "",
            Email: "",
            EmailConfirmation: "",
            Password: "",
            ConfirmPassword: "",
            LoginResponse: ""
        };

        this.register = function () {

            var scope = this;

            authService.register(this.model).then(function (response) {

                scope.savedSuccessfully = true;
                scope.errorsmessages = "User has been registered successfully, you will be redicted to login page in 2 seconds.";
                messageDelay(2, redirectCallback, scope);
                //messageDelay(2, redirectCallback);
            },
             function (response) {
                 var errors = [];
                 for (var key in response.data.ModelState) {
                     for (var i = 0; i < response.data.ModelState[key].length; i++) {
                         errors.push(response.data.ModelState[key][i]);
                     }
                 }
                 scope.errorsmessages = "Failed to register user due to:" + errors.join(' ');
                 scope.isError = true;
                 messageDelay(2, registerErrorCallback, scope);
             });
        };

        this.login = function () {

            var scope = this;

            authService.login(this.model).then(function (response) {
                //It will get here if succesfully logged in

                //while (sharedDataSvc.LogedUser == null) {
                //    WaitForSeconds(200);
                //}

                scope.errorsmessages = '';
                messageDelay(0, redirectToDashBoard, scope);
            }, function (response) {
                //Login error
                scope.errorsmessages = response.error_description;
            })            
        };

        this.loginAsGuest = function () {

            var scope = this;

            this.model.UserName = 'guest@gmail.com';
            this.model.Password = 'Rr!123456';
            authService.login(this.model).then(function (response) {
                //It will get here if succesfully logged in

                //while (sharedDataSvc.LogedUser == null) {
                //    WaitForSeconds(200);
                //}

                scope.errorsmessages = '';
                messageDelay(0, redirectToDashBoard, scope);
            }, function (response) {
                //Login error
                scope.errorsmessages = response.error_description;
            })
        };

        this.logout = function () {

            var scope = this;

            authService.logOut();

            messageDelay(0, redirectCallback, scope);

        };

        
        var messageDelay = function (interval, callBack, scope) {
            var timer = $timeout(function () {
                $timeout.cancel(timer);
                callBack(scope);
            }, 1000 * interval);
        }

        //var WaitForSeconds = function (interval) {
        //    var timer = $timeout(function () {
        //        $timeout.cancel(timer);
        //    }, 1000 * interval);
        //}

        var registerErrorCallback = function (scope) {
            scope.message = "Register a new account";
            scope.isError = false;
        }

        var redirectCallback = function () {
            $state.go('common.login');
        }
        var redirectToDashBoard = function () {
            $state.go('dashboard_FinancialPortal');
        }

    }]);
})();