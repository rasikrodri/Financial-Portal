CREATE TABLE [Security].[Accounts](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[HouseholdId] [int] NOT NULL,
	[Name] [nvarchar](max) NOT NULL,
	[Balance] [money] NOT NULL,
	[ReconciledBalance] [money] NOT NULL)
GO

ALTER TABLE [Security].[Accounts]
ADD CONSTRAINT [PK_Accounts] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
GO


--This line automatically adds stored procedures to insert and delete,
--select and update
AUTOPROC Insert,Select,Update [Security].[Accounts]
GO