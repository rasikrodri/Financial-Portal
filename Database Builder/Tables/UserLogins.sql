CREATE TABLE [Security].[UserLogins](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[LoginProvider] [nvarchar](128) NOT NULL,
	[ProviderKey] [nvarchar](128) NOT NULL)

GO

ALTER TABLE [Security].[UserLogins]
ADD CONSTRAINT [PK_Security.UserLogins] PRIMARY KEY CLUSTERED 
(
	[Id] ASC,
	[UserId] ASC,
	[LoginProvider] ASC,
	[ProviderKey] ASC
)
GO

ALTER TABLE [Security].[UserLogins]  WITH CHECK ADD  CONSTRAINT [FK_Security.UserLogins_Security.Users_UserId] FOREIGN KEY([UserId])
REFERENCES [Security].[Users] ([Id])
GO

ALTER TABLE [Security].[UserLogins] CHECK CONSTRAINT [FK_Security.UserLogins_Security.Users_UserId]
GO


--This line automatically adds stored procedures to insert and delete
AUTOPROC Insert,Delete [Security].[UserLogins]
GO