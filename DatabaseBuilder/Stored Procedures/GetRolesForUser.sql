CREATE PROCEDURE [Security].[GetRolesForUser]
	@userId int
AS
BEGIN
	SELECT r.[Name]
FROM [Security].[UserRoles] AS ur
INNER JOIN [Security].[Roles] r ON r.[Id] = ur.[RoleId]
WHERE ur.[UserId] = @userId
END
GO



--CREATE PROCEDURE [Security].[GetRolesForUser]
--@userId int

--AS

--SELECT r.[Name]
--FROM [Security].[UserRoles] AS ur
--INNER JOIN [Security].[Roles] r ON r.[Id] = ur.[RoleId]
--WHERE ur.[UserId] = @userId