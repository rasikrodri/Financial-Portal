CREATE PROCEDURE [Security].[GetAccountsByHousehold]
	@householdId int
AS
BEGIN
	SELECT * FROM Accounts WHERE HouseHoldId = @householdId
END
GO