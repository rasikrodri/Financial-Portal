CREATE TABLE [Security].[BudgetItems](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[HouseholdId] [int] NOT NULL,
	[Type] [nvarchar](10) NOT NULL,
	[CategoryId] [int] NOT NULL,
	[Description] [nvarchar](50) NOT NULL,
	[Amount] [money] NOT NULL,
	[AnualFrequency] [int] NOT NULL)
GO

ALTER TABLE [Security].[BudgetItems]
ADD CONSTRAINT [PK_BudgetItems] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
GO

ALTER TABLE [Security].[BudgetItems]  WITH CHECK ADD  CONSTRAINT [FK_BudgetItems_Categories] FOREIGN KEY([CategoryId])
REFERENCES [Security].[Categories] ([Id])
GO

ALTER TABLE [Security].[BudgetItems] CHECK CONSTRAINT [FK_BudgetItems_Categories]
GO

--This line automatically adds stored procedures to insert and delete,
--select and update
AUTOPROC Insert,Select,Update,Delete [Security].[BudgetItems]
GO