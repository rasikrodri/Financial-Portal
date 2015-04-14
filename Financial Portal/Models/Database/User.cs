using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using System.Collections;
using System.Collections.Generic;

namespace AngularTemplate.Models.Database
{
    public class ApplicationUser : IUser<int>
    {
        public int Id { get; set; }
        public int Household { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string PasswordHash { get; set; }
        public string SecurityStamp { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsLockedOut { get; set; }
        public string AccountConfirmationToken { get; set; }
        public string PasswordResetToken { get; set; }
        public DateTimeOffset PasswordResetExpiry { get; set; }
        public DateTimeOffset LockoutEndDate { get; set; }
        public int AccessFailedCount { get; set; }
        public bool EmailConfirmed { get; set; }
        public bool PhoneNumberConfirmed { get; set; }
        public bool TwoFactorEnabled { get; set; }
        public bool LockoutEnabled { get; set; }

        public IEnumerable<HouseholdInvitation> Notifications { get; set; }

        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser, int> manager, string authType = DefaultAuthenticationTypes.ApplicationCookie)
        {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, authType);
            // Add custom user claims here
            return userIdentity;
        }
    }

    public class UserInfo
    {
        public string Name { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
        public string NewPasswordConfirmation { get; set; }
    }
}