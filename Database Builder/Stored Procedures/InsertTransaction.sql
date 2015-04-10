
CREATE PROCEDURE [Security].[InsertTransaction]
(
	@AccountId int,
	@Amount money,
	@AbsAmount money,--Used to store the old value
	@ReconciledAmount money,
	@AbsReconciledAmount money,--Used to store the old value
	@Date datetimeoffset,
	@Description nvarchar(MAX) = NULL,
	@Updated datetimeoffset,
	@UpdatedByUserId int,
	@CategoryId int,
	@IsCredit bit
)
AS

DECLARE @amountDifference money;
SET @amountDifference = @Amount - @AbsAmount;

DECLARE @reconciledamountDifference money;
SET @reconciledamountDifference = @ReconciledAmount - @AbsReconciledAmount;

UPDATE [Accounts] SET
[Balance] = iif(@isCredit = 1,  [Balance] + @amountDifference, [Balance] - @amountDifference),
[ReconciledBalance] = iif(@isCredit = 1,  [ReconciledBalance] + @reconciledamountDifference, [ReconciledBalance] - @reconciledamountDifference)
WHERE
	[Id]=@AccountId

DECLARE @T TABLE(
[Id] int)

INSERT INTO [Security].[Transactions]
(
	[AccountId],
	[Amount],
	[AbsAmount],
	[ReconciledAmount],
	[AbsReconciledAmount],
	[Date],
	[Description],
	[Updated],
	[UpdatedByUserId],
	[CategoryId],
	[IsCredit]
)
OUTPUT
	Inserted.[Id]
INTO @T
VALUES
(
	@AccountId,
	@Amount,
	@AbsAmount,
	@ReconciledAmount,
	@AbsReconciledAmount,
	@Date,
	@Description,
	@Updated,
	@UpdatedByUserId,
	@CategoryId,
	@IsCredit
)
SELECT * FROM @T
--EXEC UpdateAccountBal_Rec @AccountId, @IsCredit, @ReconciledAmount;