CREATE PROCEDURE [Security].[GetBudgetItemsByHousehold]
	@householdId int
AS
BEGIN
	SELECT * FROM BudgetItems WHERE HouseholdId = @householdId
END
GO