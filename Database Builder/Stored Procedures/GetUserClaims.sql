CREATE PROCEDURE [Security].[GetUserClaims]
	@userId int
AS
BEGIN
	SELECT * FROM UserClaims WHERE UserId = @userId
END
GO



--CREATE PROCEDURE [Security].[GetRolesUserClaims]
--@userId int

--AS

--SELECT * FROM UserClaims WHERE UserId = @userId