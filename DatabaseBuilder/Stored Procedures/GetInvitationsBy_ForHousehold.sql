CREATE PROCEDURE [Security].[GetInvitationsBy_ForHousehold]
	@forHouseholdId int
AS
BEGIN
	SELECT * FROM [security].Invitations WHERE ForHouseholdId = @forHouseholdId
END
GO



--CREATE PROCEDURE [Security].[GetLonginsByUserId]
--@userId int

--as

--SELECT * FROM security.userlogins WHERE userid = @userId