CREATE PROCEDURE [Security].[DeleteAccount]
(
	@Id int
)
AS

DELETE FROM [Security].[Transactions] WHERE
[AccountId]=@Id

DELETE FROM [Security].[Accounts] WHERE
	[Id]=@Id

