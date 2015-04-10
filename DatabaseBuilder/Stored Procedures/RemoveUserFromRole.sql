CREATE PROCEDURE [Security].[RemoveUserFromRole]
	@userId int, @role nvarchar(50)
AS
BEGIN
	DELETE ur
FROM [Security].[UserRoles] ur
join [Security].[Roles] r ON r.[Name] = @role
WHERE ur.UserId = @userId AND r.[Name] = @role
END
GO



--CREATE PROCEDURE [Security].[RemoveUserFromRole]
--@userId int, @role nvarchar(50)

--AS

--DELETE ur
--FROM [Security].[UserRoles] ur
--join [Security].[Roles] r ON r.[Name] = @role
--WHERE ur.UserId = @userId AND r.[Name] = @role