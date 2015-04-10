/**
 * HOMER - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 */

function configState($stateProvider, $urlRouterProvider, $compileProvider, $locationProvider, $httpProvider) {

    // Optimize load start with remove binding information inside the DOM element
    $compileProvider.debugInfoEnabled(true);

    // Set default state
    $urlRouterProvider.otherwise("/dashboard_FinancialPortal");
    $stateProvider
        
        // Common views
        .state('common', {
            abstract: true,
            url: "/common",
            templateUrl: "views/common/content_empty.html",
            data: {
                pageTitle: 'Common',

                Authorize: 'All'
            }
        })
        .state('common.login', {
            url: "/login",
            templateUrl: "views/common_app/login.html",
            data: {
                pageTitle: 'Login page',
                specialClass: 'blank',

                Authorize: 'Anonymous'
            }
        })
        .state('common.register', {
            url: "/register",
            templateUrl: "views/common_app/register.html",
            data: {
                pageTitle: 'Register page',
                specialClass: 'blank',

                Authorize: 'Anonymous'
            }
        })
        .state('common.error_one', {
            url: "/error_one",
            templateUrl: "views/common_app/error_one.html",
            data: {
                pageTitle: 'Error 404',
                specialClass: 'blank',

                Authorize: 'All'
            }
        })
        .state('common.error_two', {
            url: "/error_two",
            templateUrl: "views/common_app/error_two.html",
            data: {
                pageTitle: 'Error 505',
                specialClass: 'blank',

                Authorize: 'All'
            }
        })
        .state('common.lock', {
            url: "/lock",
            templateUrl: "views/common_app/lock.html",
            data: {
                pageTitle: 'Lock page',
                specialClass: 'blank',

                Authorize: 'All'
            }
        })
        



    // Dashboard - Main page
        .state('dashboard_FinancialPortal', {
            url: "/dashboard_FinancialPortal",
            templateUrl: "views/Financial_Portal/dashboard.html",
            data: {
                pageTitle: 'Dashboard',

                Authorize: 'All'
            }
        })

    // Accounts
        .state('accounts_home', {
            url: "/accounts",
            templateUrl: "views/Financial_Portal/accounts_home.html",
            data: {
                pageTitle: 'Accounts Home',

                Authorize: 'All'
            }
        })

    // My Budget
        .state('my_budget', {
            url: "/budget",
            templateUrl: "views/Financial_Portal/my_budget.html",
            data: {
                pageTitle: 'My Budget',

                Authorize: 'All'
            }//,
            //resolve: {
            //    budgetItems: ['sharedDataSvc', function (sharedDataSvc) {
            //        return sharedDataSvc.GetBudgetItems()
            //    }],
            //    categories: ['sharedDataSvc', function (sharedDataSvc) {
            //        return sharedDataSvc.GetAllCategories()
            //    }]
            //}
        })

    //Household
        .state('household', {
            url: "/household",
            templateUrl: "views/Financial_Portal/household.html",
            data: {
                pageTitle: 'Household',

                Authorize: 'All'
            }
        })

    //transactions
        .state('account_transactions', {
            url: "/transactions/:accountId",
            templateUrl: "views/Financial_Portal/account_transactions.html",
            data: {
                pageTitle: 'Transactions',

                Authorize: 'All'
            },
            resolve: {
                AccountToEdit: ['$stateParams', 'sharedDataSvc', function ($stateParams, sharedDataSvc) {
                    return sharedDataSvc.GetAccount($stateParams.accountId)
                    .then(function (data) {
                       sharedDataSvc.SelectedAccountToEdit = data;
                    });
                }]
            }
        })
        
    //Edit User Info
        .state('edit_user_info', {
            url: "/edit_user_info",
            templateUrl: "views/Financial_Portal/edit_user_info.html",
            data: {
                pageTitle: 'User Info',

                Authorize: 'All'
            }
        })



    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

    $httpProvider.interceptors.push('authInterceptorService');


}

angular
    .module('app')
    .config(configState)
    .run(function ($rootScope, $state, $templateCache, $stateParams, authService, sharedDataSvc) {
        //Place any global variable in here so any thing in the whole application can use it 

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        authService.fillAuthData();

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            //For later improved security
            var authorized = false;

            if (toState.data.Authorize.indexOf("Anonymous") > -1)
                authorized = true
            else {
                if (authService.authentication.isAuth) {

                    if (toState.data.Authorize.indexOf("All") > -1)
                        authorized = true;
                    else {
                        angular.forEach(authService.authentication.Roles, function (value, key) {
                            if (toState.Authorize.data.indexOf(value))
                                authorized = true;
                        });
                    }
                }
            }
            if (authorized == false) {
                event.preventDefault();
                authService.logOut();
                $state.go('common.login');
            }
        });


    });