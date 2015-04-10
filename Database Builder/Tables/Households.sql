CREATE TABLE [Security].[Households](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](max) NOT NULL)
GO

ALTER TABLE [Security].[Households]
ADD CONSTRAINT [PK_Households] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
GO


--This line automatically adds stored procedures to insert and delete,
--select and update
AUTOPROC Insert,Select,Update,Delete [Security].[Households]
GO