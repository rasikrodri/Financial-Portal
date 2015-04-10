
CREATE PROCEDURE [Security].[UpdateTransaction]
(
	@Id int,
	@AccountId int,
	@Amount money,
	@AbsAmount money,
	@ReconciledAmount money,
	@AbsReconciledAmount money,
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

UPDATE [Security].[Transactions] SET
	[AccountId]=@AccountId,
	[Amount]=@Amount,
	[AbsAmount]=@AbsAmount,
	[ReconciledAmount]=@ReconciledAmount,
	[AbsReconciledAmount]=@AbsReconciledAmount,
	[Date]=@Date,
	[Description]=@Description,
	[Updated]=@Updated,
	[UpdatedByUserId]=@UpdatedByUserId,
	[CategoryId]=@CategoryId,
	[IsCredit]=@IsCredit
OUTPUT
	Inserted.[Id]
INTO @T
WHERE
	[Id]=@Id
SELECT * FROM @T