CREATE PROCEDURE [Security].[GetLonginsByUserId]
	@userId int
AS
BEGIN
	SELECT * FROM [security].userlogins WHERE userid = @userId
END
GO



--CREATE PROCEDURE [Security].[GetLonginsByUserId]
--@userId int

--as

--SELECT * FROM security.userlogins WHERE userid = @userId