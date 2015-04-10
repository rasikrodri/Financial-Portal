
/**
 *
 * alertsCtrl
 *
 */

angular
    .module('app')
    .controller('my_budgetCtrl', my_budgetCtrl)

function my_budgetCtrl($scope, $q, sweetAlert, notify, $modal, $http, $interval, sharedDataSvc, sweetAlert, notify) {//, budgetItems, categories) {

    $scope.loading = { startAt: 0, max: 99, durationSeconds: 1 };
    sharedDataSvc.LoadingTimer($scope.loading);
    $scope.PageLoaded = false;


    //$scope.budgetitem = budgetItems;
    //$scope.categories = categories;


    this.model = {
        TypeToAdd: 'Expense',
        SelectedCategory: '',
        Categories:[],
        Description:'',
        IncomeExpenseAmount:'$0',
        AnualFrequency:0,
        Income:[],
        Expenses:[]
    }
    

    //Calls multiple http methods and wait or all of them to finish
    this.GetAllInfoFromDatabase = function () {
        var scope = this;
        $q.all([
            sharedDataSvc.GetBudgetItems(),
            sharedDataSvc.GetAllCategories()
        ]).then(function (response) {
            //separete Income from expenses
            var budgetItems = response[0];
            scope.model.Income = budgetItems[0];
            scope.model.Expenses = budgetItems[1];

            scope.model.Categories = response[1];

            $scope.PageLoaded = true;
        })
    }
    this.GetAllInfoFromDatabase();


    this.RadioBchecked = function (which) {
        this.model.TypeToAdd = which;
    }

    //Calls multiple http methods and wait or all of them to finish
    this.Save = function () {
        var scope = this;
        var catry = null;
        for (var i = 0; i < scope.model.Categories.length; i++) {
            if (typeof scope.model.Categories[i] !== 'undefined') {
                if (scope.model.Categories[i].Name === scope.model.SelectedCategory) {
                    catry = scope.model.Categories[i];
                    break;
                }
            }
        }

        if (catry === null) {
            catry = { Id: 0, HouseholdId: 0, Name: scope.model.SelectedCategory };
        }

        var budgetitem = {
            Id: 0, HouseholdId: catry.HouseholdId,
            Type: scope.model.TypeToAdd, CategoryId: 0, Category: catry,
            Description: scope.model.Description,
            Amount: sharedDataSvc.CleanNumber(scope.model.IncomeExpenseAmount), AnualFrequency: scope.model.AnualFrequency
        };

        sharedDataSvc.CreateBudgetItem(budgetitem).then(function (item) {

            //Add category if is not in the list
            var existent = false;
            for (var i = 0; i < scope.model.Categories.length; i++) {
                if (typeof scope.model.Categories[i] != 'undefined') {
                    if (item.CategoryId == scope.model.Categories[i].Id) {
                        existent = true;
                        break;
                    }
                }
            }

            if (existent == false) {
                scope.model.Categories.push(item.Category);
            }

            if (item.Type === "Expense") {
                scope.model.Expenses.push(item);
            }
            else {
                scope.model.Income.push(item);
            }


            scope.Clear();
            $scope.loading.percentage = 101;
            scope.model.Expense_Income_Added_Alert();
        })
    }

    this.Expense_Income_Added_Alert = function () {
        sweetAlert.swal({
            title: "Budget Item Created!",
            text: "Your budget item has been created!",
            type: "success"
        });
    }


    this.Clear = function () {
        this.model.SelectedCategory = '';
        this.model.Description = '';
        this.model.IncomeExpenseAmount = '$0';
        this.model.AnualFrequency = 0;
    }

    this.ConvertToCurrency = function () {
        this.model.IncomeExpenseAmount = sharedDataSvc.ConvertToCurrency(this.model.IncomeExpenseAmount);
    }

    this.Delete = function (budgetItem) {
        var scope = this;

        sweetAlert.swal({
            title: "Are you sure?",
            text: "You will not be able to recover this budget item!",
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

                    sharedDataSvc.DeleteBudgetItem(budgetItem.Id).then(function () {
                        var a = scope.model.Income.indexOf(budgetItem);
                        if (a > -1) {
                            scope.model.Income.splice(a, 1);
                        }
                        var b = scope.model.Expenses.indexOf(budgetItem);
                        if (b > -1) {
                            scope.model.Expenses.splice(b, 1);
                        }
                    })
                    sweetAlert.swal("Deleted!", "The Account has been deleted.", "success");
                } else {
                    //sweetAlert.swal("Cancelled", "Account delition canceled.", "error");
                }
            });
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
            var householdAccount = { UserName: $scope.User.UserName, HouseHold: 0, UserId: 0, Name: $scope.NewAccountName, Balance: deposit, ReconciledBalance: deposit };
            //Try to create the new account in the database
            return $http.post('/api/household/create_household_account', householdAccount).then(function (response) {
                if (response.data.Id !== 0) {

                    $modalInstance.UserAccounts.push(response.data)

                    sweetAlert.swal("Account Created!", "Account    '" + $scope.NewAccountName + "'    with a deposit of    '" + $scope.NewAccountAmount + "'    has been created.", "success");
                    $modalInstance.close();

                    return householdAccount;
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