
/**
 *
 * alertsCtrl
 *
 */

angular
    .module('app')
    .controller('account_transactionsCtrl', account_transactionsCtrl)

function account_transactionsCtrl($scope, $q, sweetAlert, notify, $modal, $http, $interval, sharedDataSvc, sweetAlert, notify) {//, budgetItems, categories) {

    this.Account = sharedDataSvc.SelectedAccountToEdit;
    this.Creating_Editing_Transaction = false;
    this.creatingOrEditingTransaction = 'editing';
    this.ColumnTransactionsSize = 12;

    this.currentTransaction;//to store the transaction that is being edited
    this.ShowCreateTransactionEditor = function () {
        this.ColumnTransactionsSize = 8;
        this.creatingOrEditingTransaction = 'Creating Transaction';
        this.Creating_Editing_Transaction = true;
    }
    this.ShowExistingTransactionEditor = function (transaction) {
        this.currentTransaction = transaction;
        //Fill the fields with the transaction's info
        this.Description = transaction.Description;
        this.Amount = this.ConvertToCurrency(transaction.Amount);
        this.IsCredit = transaction.IsCredit;

        if (this.IsCredit === true) { this.SetTransactionAsCredit(); }
        else { this.SetTransactionAsDebit(); }

        if (sharedDataSvc.CleanNumber(transaction.ReconciledAmount) === '0') {
            this.TogleReconcile = false;
        } else {
            this.TogleReconcile = true;
        }

        this.ReconciledAmount = this.ConvertToCurrency(transaction.ReconciledAmount);
        this.SelectedCategory = transaction.Category.Name;
        this.Date = transaction.Date;

        this.ColumnTransactionsSize = 8;
        this.creatingOrEditingTransaction = 'Editing Transaction';
        this.Creating_Editing_Transaction = true;
    }


    $scope.loading = { startAt: 0, max: 99, durationSeconds: 1 };
    sharedDataSvc.LoadingTimer($scope.loading);
    $scope.PageLoaded = false;

    //Called when all info loaded and deatils in page gets initialized
    $scope.BalanceAnim = 0;
    $scope.ReconciledBalanceAnim = 0;
    $scope.Animate = function (balance, reconciledBalance) {
        $scope.BalanceAnim = { startAt: 0, max: balance, durationSeconds: 2 };
        sharedDataSvc.LoadingTimer($scope.BalanceAnim, 2);

        $scope.ReconciledBalanceAnim = { startAt: 0, max: reconciledBalance, durationSeconds: 3 };
        sharedDataSvc.LoadingTimer($scope.ReconciledBalanceAnim, 2);
    }



    //$scope.budgetitem = budgetItems;
    //$scope.categories = categories;

    this.Description = '';
    this.Amount = '$0';
    this.TogleReconcile = false;
    this.IsCredit = false;

    this.credit_debit_amount_Color = 'color:red';
    this.credit_debit_button_class_Color = 'btn-danger';

    this.ReconciledAmount = '$0';
    this.SelectedCategory = '';
    this.Categories = [];
    this.Date = new Date();

    this.errorMessage = '';


    $scope.tableManager = sharedDataSvc.CreateATableManager($scope, sharedDataSvc.GetAccountTransactions, this.Account.Id);//$scope.$new(true)//creates a separate scope
    
    $scope.tableManager.$scope.Retrieve();
    
    //Calls multiple http methods and wait or all of them to finish
    this.GetAllInfoFromDatabase = function () {
        var scope = this;
        $q.all([
            sharedDataSvc.GetAllCategories()
        ]).then(function (response) {

            scope.Categories = response[0];

            $scope.PageLoaded = true;
        })
    }
    
    this.GetAllInfoFromDatabase();
    


    this.SwitchCreditOrDebit = function () {
        if (this.IsCredit === false) {
            this.SetTransactionAsCredit();
        }
        else {
            this.SetTransactionAsDebit();
        }
    }

    this.SetTransactionAsCredit = function () {
        this.credit_debit_amount_Color = '';
        this.credit_debit_button_class_Color = 'btn-success';
        this.IsCredit = true;
    }
    this.SetTransactionAsDebit = function () {
        this.credit_debit_amount_Color = 'color:red';
        this.credit_debit_button_class_Color = 'btn-danger';
        this.IsCredit = false;
    }


    this.RadioBchecked = function (which) {
        this.TypeToAdd = which;
    }

    this.SaveTransaction = function () {
        if (this.creatingOrEditingTransaction === 'Creating Transaction') {
            this.CreateTransaction();
        }
        else if (this.creatingOrEditingTransaction === 'Editing Transaction') {
            this.UpdateTransaction();
        }
    }

    this.CreateTransaction = function () {
        var scope = this;

        //Make sure all the fields have a value
        var keepGoing = true;
        if (scope.Description === '') {
            scope.errorMessage = 'Field Description cannot be empty';
            keepGoing = false;
        } else if (scope.Amount === '' || sharedDataSvc.CleanNumber(scope.Amount) === '0') {
            scope.errorMessage = 'Field Amount cannot be 0';
            keepGoing = false;

        } else if (scope.SelectedCategory === '') {
            scope.errorMessage = 'Field Category cannot be empty';
            keepGoing = false;
        }
        else { scope.errorMessage = '';}



        if (keepGoing === true) {

            var catry = null;
            for (var i = 0; i < scope.Categories.length; i++) {
                if (scope.Categories[i].Name === scope.SelectedCategory) {
                    catry = scope.Categories[i];
                    break;
                }
            }

            if (catry === null) {
                catry = { Id: 0, HouseholdId: 0, Name: scope.SelectedCategory };
            }

            var amountCleaned = sharedDataSvc.CleanNumber(scope.Amount);
            var reconcildeAmountCleaned = sharedDataSvc.CleanNumber(scope.ReconciledAmount);
            var transaction = {
                Id: 0, AccountId: scope.Account.Id, IsCredit: scope.IsCredit, Amount: amountCleaned,
                AbsAmount: '0', ReconciledAmount: reconcildeAmountCleaned,
                AbsReconciledAmount: '0', Date: scope.Date,
                Description: scope.Description, Updated: scope.Date,
                UpdatedByUserId: 0, CategoryId: catry.Id,
                Category: catry
            };

            sharedDataSvc.CreateTransaction(transaction).then(function (transaction) {

                scope.GetNewAccountInfoAfterAChange();

                //$scope.tableManager.$scope.Items.push(transaction);
                $scope.tableManager.$scope.Retrieve();

                //Add category if is not in the list
                var existent = false;
                for (var i = 0; i < scope.Categories.length; i++) {
                    if (transaction.CategoryId == scope.Categories[i].Id) {
                        existent = true;
                        break;
                    }
                }

                if (existent == false) {
                    scope.Categories.push(transaction.Category);
                }

                scope.Close();
                $scope.loading.percentage = 101;
                scope.TransactionCreated_Updated_Alert('Transaction Created', 'strong alert-success');
            })
        }
    }

    this.UpdateTransaction = function () {
        var scope = this;

        //Make sure all the fields have a value
        var keepGoing = true;
        if (scope.Description === '') {
            scope.errorMessage = 'Field Description cannot be empty';
            keepGoing = false;
        } else if (scope.Amount === '' || sharedDataSvc.CleanNumber(scope.Amount) === '0') {
            scope.errorMessage = 'Field Amount cannot be 0';
            keepGoing = false;

        } else if (scope.SelectedCategory === '') {
            scope.errorMessage = 'Field Category cannot be empty';
            keepGoing = false;
        }
        else { scope.errorMessage = '';}



        if (keepGoing === true) {

            var catry = null;
            for (var i = 0; i < scope.Categories.length; i++) {
                if (scope.Categories[i].Name === scope.SelectedCategory) {
                    catry = scope.Categories[i];
                    break;
                }
            }

            if (catry === null) {
                catry = { Id: 0, HouseholdId: 0, Name: scope.SelectedCategory };
            }

            var amountCleaned = sharedDataSvc.CleanNumber(this.Amount);
            var reconcildeAmountCleaned = sharedDataSvc.CleanNumber(this.ReconciledAmount);

            var transaction = {
                Id: scope.currentTransaction.Id, AccountId: scope.Account.Id, IsCredit: scope.IsCredit, Amount: amountCleaned,
                AbsAmount: scope.currentTransaction.Amount, ReconciledAmount: reconcildeAmountCleaned,
                AbsReconciledAmount: scope.currentTransaction.ReconciledAmount, Date: scope.Date,
                Description: scope.Description, Updated: new Date(),
                UpdatedByUserId: 0, CategoryId: catry.Id,
                Category: catry
            };

            sharedDataSvc.UpdateTransaction(transaction).then(function (transaction) {

                scope.GetNewAccountInfoAfterAChange();

                for (var i = 0; i < $scope.tableManager.$scope.Items.length; i++) {
                    if ($scope.tableManager.$scope.Items[i].Id == transaction.Id) {
                        $scope.tableManager.$scope.Items[i] = transaction;
                        break;
                    }
                }

                //Add category if is not in the list
                var existent = false;
                for (var i = 0; i < scope.Categories.length; i++) {
                    if (transaction.CategoryId == scope.Categories[i].Id) {
                        existent = true;
                        break;
                    }
                }

                if (existent == false) {
                    scope.Categories.push(transaction.Categories);
                }

                scope.Close();
                $scope.loading.percentage = 101;
                //scope.Expense_Income_Added_Alert();
                scope.TransactionCreated_Updated_Alert('Transaction Updated', 'alert-success');
            })
        }
    }

    this.DeleteTransaction = function (trans) {
        var scope = this;
        sweetAlert.swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Transaction!",
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
                    sharedDataSvc.DeleteTransaction(trans).then(function (transactionId) {

                        if (typeof scope.currentTransaction !== 'undefined') {
                            if (scope.currentTransaction.Id === transactionId) {
                                scope.Close();
                            }
                        }

                        for (var i = 0; i < $scope.tableManager.$scope.Items.length; i++) {
                            if ($scope.tableManager.$scope.Items[i].Id == transactionId) {
                                $scope.tableManager.$scope.Items.splice(i, 1);
                                break;
                            }
                        }

                        
                        scope.GetNewAccountInfoAfterAChange();
                        
                        $scope.tableManager.$scope.Retrieve();

                        sweetAlert.swal("Deleted!", "The transaction has been deleted.", "success");
                    });
                    
                } else {
                    //sweetAlert.swal("Cancelled", "Account delition canceled.", "error");
                }
            });
    }

    this.GetNewAccountInfoAfterAChange = function () {
        var scope = this;
        //Get the updated Account
        sharedDataSvc.GetAccount(scope.Account.Id)
            .then(function (account) {
                scope.Account = account;
                $scope.BalanceAnim.At = scope.Account.Balance;
                $scope.ReconciledBalanceAnim.At = scope.Account.ReconciledBalance;
            });
    }

    this.TransactionCreated_Updated_Alert = function (message, classToUse) {
        notify({
            message: message,
            classes: classToUse,
            templateUrl: 'views/notification/notify.html',
        });
    };

    this.Reset = function () {
        if (this.creatingOrEditingTransaction === 'Editing Transaction') {
            this.IsCredit = this.currentTransaction.IsCredit;

            if (this.IsCredit === true) { this.SetTransactionAsCredit(); }
            else { this.SetTransactionAsDebit(); }

            this.Description = this.currentTransaction.Description;
            this.Amount = this.ConvertToCurrency(this.currentTransaction.Amount);
            //this.TransactionType = this.currentTransaction;
            this.ReconciledAmount = this.ConvertToCurrency(this.currentTransaction.ReconciledAmount);
            this.SelectedCategory = this.currentTransaction.Category.Name;
            this.Date = this.currentTransaction.Date;
        }
        else {
            this.Description = '';
            this.Amount = '$0';
            this.SetTransactionAsCredit();
            this.ReconciledAmount = '$0';
            this.SelectedCategory = '';
            this.Date = new Date();
        }

        this.errorMessage = '';
    }

    this.Close = function () {
        this.SelectedCategory = '';
        this.Description = '';
        this.Amount = '$0';
        this.IsCredit = true;
        this.SetTransactionAsDebit();
        this.ReconciledAmount = '$0';

        this.errorMessage = '';

        this.ColumnTransactionsSize = 12;
        this.Creating_Editing_Transaction = false;
    }

    this.GetReconcileAmount = function () {
        if (sharedDataSvc.CleanNumber(this.ReconciledAmount) === '0') {
            return this.Amount;
        } else {
            return this.ReconciledAmount;
        }
    }

    this.ConvertToCurrency = function (number) {
        return sharedDataSvc.ConvertToCurrency(number);
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