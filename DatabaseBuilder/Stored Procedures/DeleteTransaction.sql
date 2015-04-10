CREATE PROCEDURE [Security].[DeleteTransaction]
(
	@Id int,
	@AccountId int,
	@isCredit bit,
	@amount money,
	@reconciledamount money
)
AS

DELETE FROM [Security].[Transactions] WHERE
[Id]=@Id

UPDATE [Accounts] SET
[Balance] = iif(@isCredit = 1,  [Balance] - @amount, [Balance] + @amount),
[ReconciledBalance] = iif(@isCredit = 1,  [ReconciledBalance] - @reconciledamount, [ReconciledBalance] + @reconciledamount)
WHERE
	[Id]=@AccountId


