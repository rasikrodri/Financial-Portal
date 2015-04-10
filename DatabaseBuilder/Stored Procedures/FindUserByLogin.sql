CREATE PROCEDURE [Security].[FindUserByLogin]
	@loginProvider nvarchar(128), @providerKey nvarchar(128)
AS
BEGIN
	SELECT u. *
FROM SECURITY.Users AS u
INNER JOIN SECURITY.UserLogins AS l ON u.Id = l.UserId
WHERE (l.LoginProvider = @loginProvider)
	AND (l.ProviderKey = @providerKey)
END
GO



--CREATE PROCEDURE [Security].[FindUserByLogin]
--@loginProvider nvarchar(128), @providerKey nvarchar(128)

--AS

--SELECT u. *
--FROM SECURITY.Users AS u
--INNER JOIN SECURITY.UserLogins AS l ON u.Id = l.UserId
--WHERE (l.LoginProvider = @loginProvider)
--	AND (l.ProviderKey = @providerKey)