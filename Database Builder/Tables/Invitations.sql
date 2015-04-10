CREATE TABLE [Security].[Invitations](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ForHouseholdId] [int] NOT NULL,
	[FromUserId] [int] NOT NULL,
	[FromUser_Name] [nvarchar](max) NOT NULL,
	[FromUser_UserName] [nvarchar](max) NOT NULL,
	[ToUserId]  [int] NOT NULL,
	[ToUser_UserName] [nvarchar](max) NOT NULL)
GO

ALTER TABLE [Security].[Invitations]
ADD CONSTRAINT [PK_Invitations] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
GO
--This line automatically adds stored procedures to insert and delete,
--select and update
AUTOPROC Insert,Select,Update,Delete [Security].[Invitations]
GO
