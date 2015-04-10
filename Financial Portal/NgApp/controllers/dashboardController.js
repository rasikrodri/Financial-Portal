
angular
    .module('app')
    .controller('dashboardController', dashboardController)
    function dashboardController($scope, $state, $q, $stateParams, sharedDataSvc) 
    {

            $scope.loading = { startAt: 0, max: 99, durationSeconds: 1 };
            sharedDataSvc.LoadingTimer($scope.loading);
            $scope.PageLoaded = false;

            var scope = this;
            this.model = {

                HoseholdAccounts: [],

                Latest_Transactions: [],

                IncomeTotal:0,
                ExpensessTotal:0,

                ShowBudgetVsExpenses: false,

                Donut: {
                    doughnutData: [],
                    doughnutOptions:[]
                },

                ShowMonthlyTransactions: false,

                BarChart: {
                    barOptions: [],
                    barData: []
                }
                
            }
       


            this.CreatePieChart = function (reconciled, unreconciled) {
                
                return { data: [unreconciled, reconciled], options: { fill: ["#FF3300", "#7CCF7C"] } }
            };


            this.Setup_Accounts_Data = function (data) {
                scope.model.HoseholdAccounts = data;

                for (var i = 0; i < scope.model.HoseholdAccounts.length; i++) {
                    scope.model.HoseholdAccounts[i].Balance = parseFloat(scope.model.HoseholdAccounts[i].Balance);
                    scope.model.HoseholdAccounts[i].ReconciledBalance = parseFloat(scope.model.HoseholdAccounts[i].ReconciledBalance);
                    var bal = scope.model.HoseholdAccounts[i].Balance;
                    var rec = scope.model.HoseholdAccounts[i].ReconciledBalance;
                    var percentage = bal / 100;
                    if (bal == 0 && rec == 0) {
                        percentage = 0;
                    }
                    else {
                        percentage = rec / percentage;
                        percentage = Number((100 - percentage).toFixed(2));
                        //convert to positive
                        if (percentage < 0) {
                            percentage = Math.abs(percentage);
                        }
                    }


                    var unreconciled = percentage;
                    var reconciled = 100 - unreconciled;
                    percentage = reconciled;

                    scope.model.HoseholdAccounts[i].SpendingsPercent = percentage;
                    scope.model.HoseholdAccounts[i].SpendingsPie = scope.CreatePieChart(reconciled, unreconciled);
                }
            }

            this.Setup_LatestTransactions_Data = function (data) {
                scope.model.Latest_Transactions = data;
            }

            
            this.Setup_Doughnut_Chart_Data = function (data) {
                var income = data[0];
                var expenses = data[1];
                var incomeMoney = 0;
                var expensesMoney = 0;
                var divisor = 0;
                for (var i = 0; i < income.length; i++) {
                    divisor = 12 / income[i].AnualFrequency;//In case the income is les than 12 time a year
                    incomeMoney += income[i].Amount / divisor;
                }

                scope.model.IncomeTotal = incomeMoney;

                for (var i = 0; i < expenses.length; i++) {
                    divisor = 12 / expenses[i].AnualFrequency;//In case the expense is les than 12 time a year
                    expensesMoney += expenses[i].Amount;
                }

                scope.model.ExpensessTotal = expensesMoney;

                var div = (incomeMoney / 100) || 0;
                var persentSpendings = (expensesMoney / div) || 0;
                var percentBudegtLeft = 100 - persentSpendings;


                scope.model.Donut.doughnutData = [
                    //{
                    //    value: 20,
                    //    color: "#62cb31",
                    //    highlight: "#57b32c",
                    //    label: "App"
                    //},
                    {
                        value: percentBudegtLeft,
                        color: "#62cb31",
                        highlight: "#57b32c",
                        label: "Budget Percent"
                    },
                    {
                        value: persentSpendings,
                        color: "rgba(255, 102, 0, .7)",
                        highlight: "rgba(255, 102, 0, 1)",
                        label: "Spendings Percent"
                    }
                ];

                scope.model.Donut.doughnutOptions = {
                    segmentShowStroke: true,
                    segmentStrokeColor: "#fff",
                    segmentStrokeWidth: 1,
                    percentageInnerCutout: 45, // This is 0 for Pie charts
                    animationSteps: 100,
                    animationEasing: "easeOutBounce",
                    animateRotate: true,
                    animateScale: false,
                    tooltipTemplate: "% <%= value %>"
                };


            }

            this.Setup_BarChart_Data = function (months) {
                scope.model.BarChart.barOptions = {
                    showTooltips: false,
                    scaleBeginAtZero: true,
                    scaleShowGridLines: true,
                    scaleGridLineColor: "rgba(0,0,0,.05)",
                    scaleGridLineWidth: 1,
                    barShowStroke: true,
                    barStrokeWidth: 1,
                    barValueSpacing: 5,
                    barDatasetSpacing: 1,
                    multiTooltipTemplate: "$ <%= value %>"
                };

                var credits = [];
                var debits = [];
                for (var i = 0; i < months.length; i++){
                    //Create were to store the total of credits and debits
                    months[i].Credit=0;
                    months[i].Debit=0;

                    //add up all the expenses for this month
                    for (var a = 0; a < months[i].Value.length; a++) {
                        if(months[i].Value[a].IsCredit === true){
                            months[i].Credit += months[i].Value[a].Amount;
                        } else {
                            months[i].Debit += months[i].Value[a].Amount;
                        }
                    }

                    credits.push(months[i].Credit);
                    debits.push(months[i].Debit);
                }

                //Build the array with the months
                var lables = [];
                
                for (var i = 0; i < months.length; i++) {
                    var date = new Date(months[i].Value[0].Updated);
                    lables.push(scope.GetMonthName(date.getMonth() + 1) + ' ' + date.getFullYear() + '  C(' + sharedDataSvc.ConvertToCurrency(credits[i]) + ')  D(' + sharedDataSvc.ConvertToCurrency(debits[i]) +')');//In Date January is 0
                }

                scope.model.BarChart.barData = {
                    labels: lables,
                    datasets: [
                        {
                            label: "Credits",
                            fillColor: "rgba(98, 203, 49, .5)",
                            strokeColor: "rgba(98,203,49,0.7)",
                            pointColor: "rgba(98,203,49,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(26,179,148,1)",
                            data: credits
                        },
                        {
                            label: "Debits",
                            fillColor: "rgba(255, 102, 0, .5)",
                            strokeColor: "rgba(220,220,220,1)",
                            pointColor: "rgba(220,220,220,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(220,220,220,1)",
                            data: debits
                        }
                    ]
                };

            }

            this.GetMonthName = function (monthNum) {
                switch(monthNum)
                {
                    case 1:
                        return 'Jan';
                    case 2:
                        return 'Feb';
                    case 3:
                        return 'Mar';
                    case 4:
                        return 'Apr';
                    case 5:
                        return 'May';
                    case 6:
                        return 'Jun';
                    case 7:
                        return 'July';
                    case 8:
                        return 'Aug';
                    case 9:
                        return 'Sept';
                    case 10:
                        return 'Oct';
                    case 11:
                        return 'Nov';
                    case 12:
                        return 'Dec';
                    default:
                        return 'Error';
                }
            }


            
            this.GetAllInfoFromDatabase = function () {
                
                $q.all([
                        sharedDataSvc.GetAccounts(),
                        sharedDataSvc.Get12MonthsTotals(),
                        sharedDataSvc.GetBudgetItems()
                ]).then(function (response) {

                    scope.Setup_Accounts_Data(response[0]);

                    scope.Setup_LatestTransactions_Data(response[1].Latest_SevenTransactions);

                    if (response[1].MontlyTransactions.length > 0) {
                        scope.Setup_BarChart_Data(response[1].MontlyTransactions);
                        scope.model.ShowMonthlyTransactions = true;
                    }

                    scope.Setup_Doughnut_Chart_Data(response[2]);

                    

                    $scope.PageLoaded = true;
                });
            }
            this.GetAllInfoFromDatabase();

}
