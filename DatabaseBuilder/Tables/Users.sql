CREATE TABLE [Security].[Users](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Household] [int] NOT NULL,
	[UserName] [nvarchar](128) NOT NULL,
	[Name] [nvarchar](128) NULL,
	[Email] [nvarchar](128) NULL,
	[PhoneNumber] [nvarchar](128) NULL,
	[PasswordHash] [nvarchar](max) NULL,
	[SecurityStamp] [nvarchar](max) NULL,
	[IsDeleted] [bit] NOT NULL,
	[IsLockedOut] [bit] NOT NULL,
	[AccountActivationToken] [nvarchar](max) NULL,
	[PasswordResetToken] [nvarchar](128) NULL,
	[PasswordResetExpiry] [datetimeoffset](7) NULL,
	[LockoutEndDate] [datetimeoffset](7) NULL,
	[AccessFailedCount] [int] NOT NULL,
	[EmailConfirmed] [bit] NOT NULL,
	[PhoneNumberConfirmed] [bit] NOT NULL,
	[TwoFactorEnabled] [bit] NOT NULL,
	[LockoutEnabled] [bit] NOT NULL)
GO

ALTER TABLE [Security].[Users]
ADD CONSTRAINT [PK_Security.Users] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
GO

ALTER TABLE [Security].[Users] ADD  DEFAULT ((0)) FOR [Household]
GO

ALTER TABLE [Security].[Users] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO

ALTER TABLE [Security].[Users] ADD  DEFAULT ((0)) FOR [IsLockedOut]
GO

ALTER TABLE [Security].[Users] ADD  DEFAULT ((0)) FOR [AccessFailedCount]
GO

ALTER TABLE [Security].[Users] ADD  DEFAULT ((0)) FOR [EmailConfirmed]
GO

ALTER TABLE [Security].[Users] ADD  DEFAULT ((0)) FOR [PhoneNumberConfirmed]
GO

ALTER TABLE [Security].[Users] ADD  DEFAULT ((0)) FOR [TwoFactorEnabled]
GO

ALTER TABLE [Security].[Users] ADD  DEFAULT ((1)) FOR [LockoutEnabled]
GO




CREATE UNIQUE NONCLUSTERED INDEX IX_Users_Username 
    ON [Security].[Users] ( Username ) 
GO


--This line automatically adds stored procedures to insert and delete,
--select and update
AUTOPROC Insert,Select,Update,Delete [Security].[Users]
GO