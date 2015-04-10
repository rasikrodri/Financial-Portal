CREATE PROCEDURE [Security].[GetHouseholdCategories]
	@householdId int
AS
BEGIN
	SELECT * FROM Categories WHERE HouseholdId = @householdId
END
GO