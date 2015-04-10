angular
    .module('app')
    .service('sharedDataSvc', sharedDataSvc)

function sharedDataSvc($http, $q, $interval, $modal) {

    //Account editing area
    this.SelectedAccountToEdit;
    //////////////////////

    this.UpdateUserInfo = function (userInfo) {
        return $http.post('/api/Account/update_user_info', userInfo).then(function (response) {
            return response.data;
        });
    }
    this.ChangePassword = function (userInfo) {
        //create the changepasswordbindingmodel
        var model = { OldPassword: userInfo.OldPassword, NewPassword: userInfo.NewPassword, ConfirmPassword: userInfo.NewPasswordConfirmation }
        return $http.post('/api/Account/ChangePassword', model).success(function (response) {
            return response;
        }).error(function (response) {
            return response;
        });
    }





    this.GetHousehold = function () {
        return $http.get('/api/household/get_Household').then(function (response) {
            return response.data;
        });
    }
    this.SendHouseholdInvitation = function (userToInvite) {
        return $http.post('/api/household/send_household_invitation', userToInvite).then(function (response) {
            return response.data;
        });
    }
    this.JoinInvitedHousehold = function (id) {
        return $http.post('/api/household/join_invited_household', id).then(function (response) {
            return response.data;
        });
    }
    this.DeleteHouseholdInvitation = function (id) {
        return $http.post('/api/household/delete_household_invitation', id).then(function (response) {
            return response.data;
        });
    }

    this.GetUserNotifications = function (username) {
        return $http.get('/api/household/get_user_nitifications/?username=' + username).then(function (response) {
            return response.data;
        });
    }

    this.GetAccounts = function () {
        return $http.get('/api/household/get_user_household_accounts').then(function (response) {
            return response.data;
        });
    }
    //this.Get_Latest_Transactions = function () {
    //    return $http.get('/api/household/get_last_transactions').then(function (response) {
    //        return response.data;
    //    });
    //}
    this.createAccountModal = function (GetAccounts) {
        var modalInstance = $modal.open({
            templateUrl: 'views/Financial_Portal/modal_add_account.html',
            controller: CreateAccountModalInstanceCtrl,
        });

        modalInstance.GetAccounts = GetAccounts;
        modalInstance.CreatingAccount = true;
    };
    this.CreateAccount = function (account) {
        return $http.post('/api/household/create_household_account', account).then(function (response) {
            return response.data;
        });
    }
    this.updateAccountModal = function (account) {
        var modalInstance = $modal.open({
            templateUrl: 'views/Financial_Portal/modal_update_account.html',
            controller: UpdateAccountModalInstanceCtrl,
        });

        modalInstance.Account = account;
    };
    this.UpdateAccount = function (account) {
        return $http.post('/api/household/update_household_account', account).then(function (response) {
            return response.data;
        });
    }
    this.DeleteAccount = function (Id) {
        return $http.post('/api/household/delete_household_account', Id).then(function (response) {
            return response.data;
        });
    }
    this.GetAccount = function (Id) {
        return $http.get('/api/household/get_account/?Id=' + Id).then(function (response) {
            return response.data;
        });
    }
    this.GetAccountTransactions = function (Id) {
        return $http.get('/api/household/get_account_transactions/?Id=' + Id).then(function (response) {
            return response.data;
        });
    }
    this.CreateTransaction = function (transaction) {
        return $http.post('/api/household/create_transaction', transaction).then(function (response) {
            return response.data;
        });
    }
    this.DeleteTransaction = function (transaction) {
        return $http.post('/api/household/delete_transaction', transaction).then(function (response) {
            return response.data;
        });
    }
    this.UpdateTransaction = function (transaction) {
        return $http.post('/api/household/update_transaction', transaction).then(function (response) {
            return response.data;
        });
    }

    this.GetAllCategories = function () {
        return $http.get('/api/household/get_categories').then(function (response) {
            return response.data;
        });
    }
    this.CreateCategory = function (category) {
        return $http.post('/api/household/create_category', category).then(function (response) {
            return response.data;
        });
    }
    this.CreateBudgetItem = function (budgetitem) {
        return $http.post('/api/household/create_budgetItem', budgetitem).then(function (response) {
            return response.data;
        });
    }
    this.DeleteBudgetItem = function (itemId) {
        return $http.post('/api/household/delete_budgetItem', itemId).then(function (response) {
            return response.data;
        });
    }
    this.GetBudgetItems = function () {
        return $http.get('/api/household/get_budgetItems').then(function (response) {
            return response.data;
        });
    }
    this.Get12MonthsTotals = function () {
        return $http.get('/api/household/get_12_months_history').then(function (response) {
            return response.data;
        });
    }

    this.CreateEmptyApplicationUser = function () {
        return {
            Id: 0,
            Household: 0,
            UserName: '',
            Name: '',
            Email: '',
            PhoneNumber: '',
            PasswordHash: '',
            SecurityStamp: '',
            IsDeleted: false,
            IsLockedOut: false,
            PasswordResetToken: '',
            PasswordResetExpiry: new Date(),
            LockoutEndDate: new Date(),
            AccessFailedCount: 0,
            EmailConfirmed: true,
            PhoneNumberConfirmed: true,
            TwoFactorEnabled: false,
            LockoutEnabled: false,
            Notifications: []
        }
    }

    //Creates an object that manages normal tables using ng-grid components
    //Remember to initialize it so that all items get loaded
    //In case a ItemsToDisplay array was not passed, Initialize will return it.
    this.CreateATableManager = function ($scope, getItemsFunction, getItems_Object_to_pass) {
        var tm = {
            $scope: $scope,

            Initialize: function () {

                $scope.Items = [];
                $scope.GetItems = getItemsFunction;
                $scope.getItems_Object_to_pass = ''; if (getItems_Object_to_pass !== 'undefined') { $scope.getItems_Object_to_pass = getItems_Object_to_pass; }
                $scope.SortingAccending = false;
                $scope.totalServerItems = 0;
                //For marking when we done with the first retrieving in order to know when it is done.
                $scope.doneFirstRetrievingDone = false;

                $scope.SortTable = function (colName) {
                    if ($scope.SortingAccending === true) {
                        $scope.Items.sort(function (a, b) { return a[colName] > b[colName]; });
                        $scope.SortingAccending = false;
                    } else {
                        $scope.Items.sort(function (a, b) { return a[colName] < b[colName]; });
                        $scope.SortingAccending = true;
                    }
                }

                $scope.filterOptions = {
                    filterText: "",
                    useExternalFilter: true
                };
                $scope.pagingOptions = {
                    pageSizes: [10, 25, 100],
                    pageSize: 10,
                    currentPage: 1,
                    searchText: ''
                };
                $scope.setPagingData = function (data, page, pageSize) {
                    $scope.Items = data.slice((page - 1) * pageSize, page * pageSize);
                    $scope.totalServerItems = data.length;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }

                    $scope.doneFirstRetrievingDone = true;
                };

                $scope.Retrieve = function () {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.pagingOptions.searchText)
                }

                $scope.getPagedDataAsync = function (pageSize, page, query) {
                    setTimeout(function () {
                        var data;
                        if (typeof query !== "undefined" && query !== '') {
                            var ft = query.toLowerCase();
                            if ($scope.getItems_Object_to_pass !== '') {
                                $scope.GetItems($scope.getItems_Object_to_pass).then(function (largeLoad) {
                                    data = largeLoad.filter(function (item) {
                                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                                    });
                                    $scope.setPagingData(data, page, pageSize);
                                })
                            } else {
                                $scope.GetItems().then(function (largeLoad) {
                                    data = largeLoad.filter(function (item) {
                                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                                    });
                                    $scope.setPagingData(data, page, pageSize);
                                })
                            }

                        } else {
                            if ($scope.getItems_Object_to_pass !== '') {
                                $scope.GetItems($scope.getItems_Object_to_pass).then(function (largeLoad) {
                                    $scope.setPagingData(largeLoad, page, pageSize);
                                });
                            } else {
                                $scope.GetItems().then(function (largeLoad) {
                                    $scope.setPagingData(largeLoad, page, pageSize);
                                });
                            }
                        }
                    }, 100);
                };

                $scope.$watch('pagingOptions', function (newVal, oldVal) {
                    if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.pagingOptions.searchText);
                    } else if (newVal !== oldVal) {
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.pagingOptions.searchText);
                    }
                }, true);
                $scope.$watch('filterOptions', function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.pagingOptions.searchText);
                    }
                }, true);


                $scope.gridOptions = {
                    data: 'myData',
                    columnDefs: [
                        //{ field: '', displayName: '',width: "15%", resizable: false },
                        //{ field: 'Name', displayName: 'Account', width: "31%", resizable: false },
                        //{ field: 'Balance', displayName: 'Balance', cellFilter: 'currency', width: "40%" },
                        //{ field: 'ReconciledBalance', displayName: 'Reconciled', cellFilter: 'currency', width: "14%" }
                    ],
                    enablePaging: true,
                    showFooter: true,
                    totalServerItems: 'totalServerItems',
                    pagingOptions: $scope.pagingOptions
                };
            }
        }

        tm.Initialize();

        return tm;
    }

    this.CleanNumber = function (value) {
        var amount
        //If number convert to text
        if (typeof value === 'number') {
            amount = value.toString()
        }
        else {
            amount = value;
        }

        //Remove comas ','
        amount = amount.replace(/,/g, "");

        //Remove everything exept '.' and  numbers
        return /^\$?(\d*\.?\d*)/.exec(amount)[1];
    };
    //It will return text regardless of if you send text or a number
    //It nevers returns a negative number. always positive
    this.ConvertToCurrency = function (value) {
        var amount;
        //If number convert to text
        if (typeof value === 'number') {
            amount = value.toString()
        }
        else {
            amount = value;
        }

        //Remove comas ','        
        amount = amount.replace(/,/g, "");

        //Remove everything exept '.' and  numbers
        var amount = /^\$?(\d*\.?\d*)/.exec(amount)[1];


        //Add the ',' 
        //Find the index of '.'
        var dotIndex = amount.indexOf('.', 0);
        var startIndex = 0;
        if (dotIndex === -1) {
            startIndex = amount.length - 1;
        }
        else {
            startIndex = dotIndex - 1;
        }

        //Now add the comas ','
        var newValue = [];//There is no string builder in js fill the array and then join everything    
        var passed = 0;
        for (var i = startIndex; i > -1; i--) {
            if (passed === 3) {
                newValue.splice(0, 0, ',');
                //newValue.push(',');
                passed = 0;
            }

            newValue.splice(0, 0, amount[i]);
            //newValue.push(amount[i]);
            passed += 1;
        }

        //Re add the '.' and the cents
        if (dotIndex !== -1) {
            newValue.push('.');
            var cents = 0;
            for (var i = dotIndex + 1; i < amount.length; i++) {
                newValue.push(amount[i]);
                cents += 1;
                if (cents === 2) {
                    break;
                }
            }
        }

        return '$' + newValue.join('');
    };


    this.LoadingTimer = function (loadingObject, howManyDecimals) {

        if (typeof howManyDecimals === 'undefined') {
            howManyDecimals = 0;
        }

        var stop;
        var currValue = 0;
        loadingObject.At = loadingObject.startAt;
        var Animate = function () {
            //// Don't start a new animation if we are already animating
            //if (angular.isDefined(stop)) return;

            //Calculate howmuch to add in order to finish int the time frame specified
            var diference = loadingObject.max - loadingObject.startAt;
            var addPerSecond = diference / loadingObject.durationSeconds;
            var addPerFrame = addPerSecond / 20;

            stop = $interval(function () {

                currValue += addPerFrame;
                if (currValue >= loadingObject.max) {
                    loadingObject.At = loadingObject.max;
                    stopAnimation();
                } else {
                    loadingObject.At = currValue.toFixed(howManyDecimals);//Controll the amount of decimals
                }
            }, 50);//20 fps / 20 updates per seconds
        };

        var stopAnimation = function () {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        var resetAnimation = function () {
            currValue = 0;
            loadingObject.At = startAt;
        };

        //Start the Animation
        Animate();
    }
}


function CreateAccountModalInstanceCtrl($scope, $modalInstance, $http, sweetAlert, authService, sharedDataSvc) {

    $scope.User = authService.authentication;

    $scope.NewAccountName = '';
    $scope.NewAccountAmount = '';
    $scope.error = '';

    $scope.ConvertToCurrency = function () {
        //Remove comas ','
        var amount = $scope.NewAccountAmount;
        amount = amount.replace(/,/g, "");

        //Remove everything exept '.' and  numbers
        var amount = /^\$?(\d*\.?\d*)/.exec(amount)[1];


        //Add the ',' 
        //Find the index of '.'
        var dotIndex = amount.indexOf('.', 0);
        var startIndex = 0;
        if (dotIndex === -1) {
            startIndex = amount.length - 1;
        }
        else {
            startIndex = dotIndex - 1;
        }

        //Now add the comas ','
        var newValue = [];//There is no string builder in js fill the array and then join everything    
        var passed = 0;
        for (var i = startIndex; i > -1; i--) {
            if (passed === 3) {
                newValue.splice(0, 0, ',');
                //newValue.push(',');
                passed = 0;
            }

            newValue.splice(0, 0, amount[i]);
            //newValue.push(amount[i]);
            passed += 1;
        }

        //Re add the '.' and the cents
        if (dotIndex !== -1) {
            newValue.push('.');
            var cents = 0;
            for (var i = dotIndex + 1; i < amount.length; i++) {
                newValue.push(amount[i]);
                cents += 1;
                if (cents === 2) {
                    break;
                }
            }
        }

        $scope.NewAccountAmount = '$' + newValue.join('');
    };
    $scope.ConvertToCurrency();

    $scope.ok = function () {
        //Make sure the new accout has a name and money
        if ($scope.NewAccountName === '') { $scope.error = "Make sure to enter a name for the new account."; }
        else if ($scope.NewAccountAmount === '$') { $scope.error = "Make sure to enter an amount to deposit."; }
        else
        {
            $scope.error = '';

            //Remove comas ','
            var amount = $scope.NewAccountAmount;
            amount = amount.replace(/,/g, "");
            //Remove everything else except the '.'
            amount = /^\$?(\d*\.?\d*)/.exec(amount)[1];
            var deposit = parseFloat(amount);
            var account = { UserName: $scope.User.UserName, HouseHold: 0, UserId: 0, Name: $scope.NewAccountName, Balance: deposit, ReconciledBalance: deposit };
            //Try to create the new account in the database
            sharedDataSvc.CreateAccount(account).then(function (data) {
                if (data.Id !== 0) {

                    //$modalInstance.UserAccounts.push(data)

                    sweetAlert.swal("Account Created!", "Account    '" + $scope.NewAccountName + "'    with a deposit of    '" + $scope.NewAccountAmount + "'    has been created.", "success");
                    $modalInstance.close();

                    //$modalInstance.GetAccounts().then(function (accounts) {
                    //    $modalInstance.Accounts = accounts;
                    //});

                    $modalInstance.GetAccounts();

                    return data;
                }
                else {

                    sweetAlert.swal("Cancelled", "There was an error, the account was not created", "error");
                }
            });




        }
    };



    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        //sweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");
    };
};
function UpdateAccountModalInstanceCtrl($scope, $modalInstance, $http, sweetAlert, authService, sharedDataSvc) {

    $scope.User = authService.authentication;

    $scope.NewAccountName = '';
    $scope.NewAccountAmount = '';
    $scope.error = '';


    $scope.ok = function () {
        //Make sure the new accout has a name and money
        if ($scope.NewAccountName === '' || $scope.NewAccountName === $modalInstance.Account.Name) {
            $scope.error = "Make sure to enter a new name for the new account.";
        }
        else
        {
            $modalInstance.Account.Name = $scope.NewAccountName;
            //Try to create the new account in the database
            sharedDataSvc.UpdateAccount($modalInstance.Account).then(function (data) {
                sweetAlert.swal("Account Updated!", "Account    '" + $modalInstance.Account.Name + "'    has been updated.", "success");
                $modalInstance.close();
            });
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        //sweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");
    };
};