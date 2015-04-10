CREATE TABLE [Security].[Categories](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](max) NOT NULL,
	[HouseholdId] [int] NOT NULL)
GO

ALTER TABLE [Security].[Categories]
ADD CONSTRAINT [PK_Categories] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
GO

--This line automatically adds stored procedures to insert and delete,
--select and update
AUTOPROC Insert,Select,Update,Delete [Security].[Categories]
GO