CREATE PROCEDURE [Security].[FindUserByActivationToken]
	-- Add the parameters for the stored procedure here
	@activationToken nvarchar(max)
AS
BEGIN
	SELECT * FROM [Security].[Users] WHERE AccountActivationToken = @activationToken
	END
GO