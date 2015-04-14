angular
    .module('app')
    .factory('authService', authService)

function authService($http, $q, localStorageService, $timeout, sharedDataSvc) {

        var serviceBase = '/';
        var authServiceFactory = {};

        var _authentication = {
            isAuth: false,
            UserName: "",
            token: "",
            Name: "",
            claims: "",
            Roles: []
        };

        var _register = function (registration) {

            _logOut();

            return $http.post('/api/account/register', registration).then(function (response) {
                return response;
            });

        };

        var _login = function (loginData) {

            

            var deferred = $q.defer();

            //Test if the account has been confirmed
            $http.get('/api/account/is_account_confirmed/?username=' + loginData.UserName).then(function (response) {
                if (response.data === 'OK') {

                    var data = "grant_type=password&username=" + loginData.UserName + "&password=" + loginData.Password;
                    $http.post('/token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

                        _authentication.isAuth = true;
                        _authentication.UserName = response.UserName;
                        _authentication.token = response.access_token;
                        _authentication.Name = response.Name;
                        _authentication.claims = response.claims;
                        _authentication.Roles = response.Roles;

                        localStorageService.set('authorizationData', _authentication);

                        deferred.resolve(response);

                    }).error(function (err, status) {
                        _logOut();
                        deferred.reject(err);
                    });
                }
                else
                {
                    _logOut();
                    var err = {error_description: response.data};
                    deferred.reject(err);
                }
            });            

            return deferred.promise;

        };

        var _logOut = function () {

            localStorageService.remove('authorizationData');

            _authentication.isAuth = false;
            _authentication.UserName = "";
            _authentication.Name = "";
            _authentication.claims = null;
            _authentication.token = "";

        };

        var _fillAuthData = function () {
            //Goes througth here when getting to the page in case there is a saved data of the loged user
            //If there is login automatically
            var authData = localStorageService.get('authorizationData');
            if (authData) {
                _authentication.isAuth = true;
                _authentication.UserName = authData.UserName;
                _authentication.token = authData.token;
                _authentication.Name = authData.Name;
                _authentication.claims = authData.claims;
                _authentication.Roles = authData.Roles;
            }
            
        }

        authServiceFactory.register = _register;
        authServiceFactory.login = _login;
        authServiceFactory.logOut = _logOut;
        authServiceFactory.fillAuthData = _fillAuthData;
        authServiceFactory.authentication = _authentication;
        
        //var WaitForSeconds = function (interval) {
        //    var timer = $timeout(function () {
        //        $timeout.cancel(timer);
        //    }, 1000 * interval);
        //}

        return authServiceFactory;


}