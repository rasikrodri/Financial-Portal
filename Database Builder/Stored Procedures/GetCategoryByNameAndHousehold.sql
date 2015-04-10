CREATE PROCEDURE [Security].[GetCategoryByNameAndHousehold]
	@name nvarchar(max),
	@householdId int
AS
BEGIN
	SELECT * FROM Categories WhERE Name = @name AND HouseholdId = @householdId
END
GO