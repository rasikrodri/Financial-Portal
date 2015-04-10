CREATE TABLE [Security].[Transactions](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[AccountId] [int] NOT NULL,
	[IsCredit] [bit] NOT NULL,
	[Amount] [money] NOT NULL,
	[AbsAmount] [money] NOT NULL,
	[ReconciledAmount] [money] NOT NULL,
	[AbsReconciledAmount] [money] NOT NULL,
	[Date] [datetimeoffset] NOT NULL,
	[Description] [nvarchar](max) NULL,
	[Updated] [datetimeoffset] NOT NULL,
	[UpdatedByUserId] [int] NOT NULL,
	[CategoryId] [int] NOT NULL)
GO

ALTER TABLE [Security].[Transactions]
ADD CONSTRAINT [PK_Transactions] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
GO

ALTER TABLE [Security].[Transactions]  WITH CHECK ADD  CONSTRAINT [FK_Transactions_Accounts] FOREIGN KEY([AccountId])
REFERENCES [Security].[Accounts] ([Id])
GO

ALTER TABLE [Security].[Transactions] CHECK CONSTRAINT [FK_Transactions_Accounts]
GO

ALTER TABLE [Security].[Transactions]  WITH CHECK ADD  CONSTRAINT [FK_Transactions_Categories] FOREIGN KEY([CategoryId])
REFERENCES [Security].[Categories] ([Id])
GO

ALTER TABLE [Security].[Transactions] CHECK CONSTRAINT [FK_Transactions_Categories]
GO

ALTER TABLE [Security].[Transactions]  WITH CHECK ADD  CONSTRAINT [FK_Transactions_Users] FOREIGN KEY([UpdatedByUserId])
REFERENCES [Security].[Users] ([Id])
GO

ALTER TABLE [Security].[Transactions] CHECK CONSTRAINT [FK_Transactions_Users]
GO

--This line automatically adds stored procedures to insert and delete,
--select and update
AUTOPROC Select [Security].[Transactions]
GO
