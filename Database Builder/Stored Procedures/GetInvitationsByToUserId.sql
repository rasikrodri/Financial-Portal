CREATE PROCEDURE [Security].[GetInvitationsByToUserId]
	@toUserId int
AS
BEGIN
	SELECT * FROM [security].Invitations WHERE ToUserId = @toUserId
END
GO



--CREATE PROCEDURE [Security].[GetLonginsByUserId]
--@userId int

--as

--SELECT * FROM security.userlogins WHERE userid = @userId