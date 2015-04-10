CREATE PROCEDURE [Security].[GetTransactionByAccountAndDateRange]
	@accountId int,
	@maxDate datetimeoffset,
	@minDate datetimeoffset
AS
BEGIN
	SELECT * FROM Transactions WHERE AccountId = @accountId AND Updated >= @minDate AND Updated <= @maxDate
END
GO



--CREATE PROCEDURE [Security].[GetRolesUserClaims]
--@userId int

--AS

--SELECT * FROM UserClaims WHERE UserId = @userId