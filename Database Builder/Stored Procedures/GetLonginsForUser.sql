CREATE PROCEDURE [Security].[GetLoginsForUser]
	@userId int
AS
BEGIN
	SELECT * FROM [security].userlogins WHERE userid = @userId
END
GO



--CREATE PROCEDURE [Security].[GetLoginsForUser]
--@userId int

--as

--SELECT * FROM security.userlogins WHERE userid = @userId