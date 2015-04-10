CREATE PROCEDURE [Security].[FindUserByEmail]
	@email nvarchar(128)
AS
BEGIN
	SELECT * FROM [Security].[Users]
WHERE Email = @email
END
GO



--CREATE PROCEDURE [Security].[FindUserByEmail]
--@email nvarchar(128)

--AS

--SELECT * FROM [Security].[Users]
--WHERE Email = @email