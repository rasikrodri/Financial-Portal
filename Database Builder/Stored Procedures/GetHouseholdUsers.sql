CREATE PROCEDURE [Security].[GetHouseholdUsers]
	@householdId int
AS
BEGIN
	SELECT * FROM Users WHERE Household = @householdId
END
GO



--CREATE PROCEDURE [Security].[FindUserByEmail]
--@email nvarchar(128)

--AS

--SELECT * FROM [Security].[Users]
--WHERE Email = @email