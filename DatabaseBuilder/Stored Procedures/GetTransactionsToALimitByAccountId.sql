CREATE PROCEDURE [Security].[GetTransactionsToALimitByAccountId]
	@accoutId int
	--We will get the latest 10 transactions
AS
BEGIN
	SELECT TOP 10 * FROM Transactions WHERE AccountId = @accoutId
END
GO



--CREATE PROCEDURE [Security].[GetRolesUserClaims]
--@userId int

--AS

--SELECT * FROM UserClaims WHERE UserId = @userId