CREATE PROCEDURE [Security].[FindUserByUserName]
	-- Add the parameters for the stored procedure here
	@userName nvarchar(128)
AS
--BEGIN
	SELECT * FROM [Security].[Users] WHERE UserName = @userName
--END
--GO



--CREATE PROCEDURE [Security].[FindUserByUserName]
--@userName nvarchar(128)

--AS

--SELECT * FROM [Security].[Users]
--WHERE UserName = @userName