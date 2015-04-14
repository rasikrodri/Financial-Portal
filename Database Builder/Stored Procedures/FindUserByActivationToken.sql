CREATE PROCEDURE [Security].[FindUserByActivationToken]
	@activationToken nvarchar(max)
AS
BEGIN
	SELECT * FROM [Security].[Users] WHERE AccountConfirmationToken = @activationToken
	END
GO