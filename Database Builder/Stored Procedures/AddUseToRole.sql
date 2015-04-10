CREATE PROCEDURE [Security].[AddUserToRole]
	@userId int, @role nvarchar(50)
AS
BEGIN
	INSERT INTO [Security].[UserRoles] (UserId, RoleId)
SELECT @userId, r.Id
FROM [Security].[Roles] r
WHERE r.Name = @role
SELECT convert(BIT, CASE @@ROWCOUNT
				WHEN 0  THEN 0
				ELSE 1
				END)
END
GO



--CREATE PROCEDURE [Security].[AddUserToRole]
--@userId int, @role nvarchar(50)

--AS

--INSERT INTO [Security].[UserRoles] (UserId, RoleId)
--SELECT @userId, r.Id
--FROM [Security].[Roles] r
--WHERE r.Name = @role
--SELECT convert(BIT, CASE @@ROWCOUNT
--				WHEN 0  THEN 0
--				ELSE 1
--				END)