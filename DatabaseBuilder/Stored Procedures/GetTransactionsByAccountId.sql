CREATE PROCEDURE [Security].[GetTransactionsByAccountId]
	@accountId int
AS
BEGIN
	SELECT * FROM Transactions WHERE AccountId = @accountId
END
GO



--CREATE PROCEDURE [Security].[GetRolesUserClaims]
--@userId int

--AS

--SELECT * FROM UserClaims WHERE UserId = @userId