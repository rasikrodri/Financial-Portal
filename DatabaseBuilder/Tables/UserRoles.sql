CREATE TABLE [Security].[UserRoles](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[RoleId] [int] NOT NULL)
GO

ALTER TABLE [Security].[UserRoles]
ADD CONSTRAINT [PK_Security.UserRoles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC,
	[UserId] ASC,
	[RoleId] ASC
)
GO

ALTER TABLE [Security].[UserRoles]  WITH CHECK ADD  CONSTRAINT [FK_Security.UserRoles_Security.Roles_RoleId] FOREIGN KEY([RoleId])
REFERENCES [Security].[Roles] ([Id])
GO

ALTER TABLE [Security].[UserRoles] CHECK CONSTRAINT [FK_Security.UserRoles_Security.Roles_RoleId]
GO

ALTER TABLE [Security].[UserRoles]  WITH CHECK ADD  CONSTRAINT [FK_Security.UserRoles_Security.Users_UserId] FOREIGN KEY([UserId])
REFERENCES [Security].[Users] ([Id])
GO

ALTER TABLE [Security].[UserRoles] CHECK CONSTRAINT [FK_Security.UserRoles_Security.Users_UserId]
GO
