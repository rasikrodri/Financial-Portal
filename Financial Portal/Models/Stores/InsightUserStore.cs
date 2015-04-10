using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AngularTemplate.Models.Database;
using Microsoft.AspNet.Identity;

namespace AngularTemplate.Models.Stores
{
    public class InsightUserStore :
        IUserPhoneNumberStore<ApplicationUser, int>,
        IUserPasswordStore<ApplicationUser, int>, 
        IUserLoginStore<ApplicationUser, int>,
        IUserRoleStore<ApplicationUser, int>, 
        IUserClaimStore<ApplicationUser, int>, 
        IUserEmailStore<ApplicationUser, int>,
        IUserLockoutStore<ApplicationUser,int>,
        IUserSecurityStampStore<ApplicationUser,int>,
        IUserTwoFactorStore<ApplicationUser,int>
    {
        private readonly IUserDataAccess _userData;

        public InsightUserStore(IUserDataAccess userData)
        {
            _userData = userData;
        }

        public void Dispose()
        {
            throw new NotImplementedException();
        }

        public Task CreateAsync(ApplicationUser user)
        {
            return _userData.InsertUserAsync(user);
        }

        public Task UpdateAsync(ApplicationUser user)
        {
            return _userData.UpdateUserAsync(user);
        }

        public Task DeleteAsync(ApplicationUser user)
        {
            return _userData.DeleteUserAsync(user.Id);
        }

        public Task<ApplicationUser> FindByIdAsync(int userId)
        {
            return _userData.SelectUserAsync(userId);
        }

        public Task<ApplicationUser> FindByNameAsync(string userName)
        {
            return _userData.FindUserByUserNameAsync(userName);
        }

        public Task SetPhoneNumberAsync(ApplicationUser user, string phoneNumber)
        {
            return Task.FromResult(user.PhoneNumber = phoneNumber);
        }

        public Task<string> GetPhoneNumberAsync(ApplicationUser user)
        {
            return Task.FromResult(user.PhoneNumber);
        }

        public Task<bool> GetPhoneNumberConfirmedAsync(ApplicationUser user)
        {
            return Task.FromResult(user.PhoneNumberConfirmed);
        }

        public Task SetPhoneNumberConfirmedAsync(ApplicationUser user, bool confirmed)
        {
            return Task.FromResult(user.PhoneNumberConfirmed = confirmed);
        }

        public Task SetPasswordHashAsync(ApplicationUser user, string passwordHash)
        {
            return Task.FromResult(user.PasswordHash = passwordHash);
        }

        public Task<string> GetPasswordHashAsync(ApplicationUser user)
        {
            return Task.FromResult(user.PasswordHash);
        }

        public Task<bool> HasPasswordAsync(ApplicationUser user)
        {
            return Task.FromResult(!string.IsNullOrWhiteSpace(user.PasswordHash));
        }

        public Task AddLoginAsync(ApplicationUser user, UserLoginInfo login)
        {
            var userLogin = new UserLogin
            {
                UserId = user.Id,
                LoginProvider = login.LoginProvider,
                ProviderKey = login.ProviderKey
            };
            return _userData.InsertUserLoginAsync(userLogin);
        }

        public Task RemoveLoginAsync(ApplicationUser user, UserLoginInfo login)
        {
            var userLogin = new UserLogin
            {
                UserId = user.Id,
                LoginProvider = login.LoginProvider,
                ProviderKey = login.ProviderKey
            };
            return _userData.DeleteUserLoginAsync(userLogin);
        }

        public async Task<IList<UserLoginInfo>> GetLoginsAsync(ApplicationUser user)
        {
            var logins = await _userData.GetLoginsForUserAsync(user.Id);
            var loginList = new List<UserLoginInfo>();
            foreach (var item in logins)
            {
                loginList.Add(new UserLoginInfo(item.LoginProvider, item.ProviderKey));
            }
            return loginList;
        }

        public Task<ApplicationUser> FindAsync(UserLoginInfo login)
        {
            return _userData.FindUserByLoginAsync(login.LoginProvider, login.ProviderKey);
        }

        public Task AddToRoleAsync(ApplicationUser user, string roleName)
        {
            return _userData.AddUserToRoleAsync(user.Id, roleName);
        }

        public Task<ApplicationUser> FindUserByActivationToken(string activationToken)
        {
            return _userData.FindUserByActivationToken(activationToken);
        }

        public Task RemoveFromRoleAsync(ApplicationUser user, string roleName)
        {
            return _userData.RemoveUserFromRoleAsync(user.Id, roleName);
        }

        public Task<IList<string>> GetRolesAsync(ApplicationUser user)
        {
            return _userData.GetRolesForUserAsync(user.Id);
        }

        public Task<bool> IsInRoleAsync(ApplicationUser user, string roleName)
        {
            return _userData.IsUserInRoleAsync(user.Id, roleName);
        }

        public async Task<IList<Claim>> GetClaimsAsync(ApplicationUser user)
        {
            var userClaim = await _userData.GetUserClaimsAsync(user.Id);
            var claims = new List<Claim>();
            foreach (var item in userClaim)
            {
                claims.Add(new Claim(item.ClaimType, item.ClaimValue));
            }

            //add any app-specific claims
            if (user.Name != null)
            {
                claims.Add(new Claim(ClaimTypes.GivenName, user.Name));
            }

            return claims;
        }

        public Task AddClaimAsync(ApplicationUser user, Claim claim)
        {
            return _userData.InsertUserClaimAsync(new UserClaim
            {
                ClaimType = claim.Type,
                ClaimValue = claim.Value,
                UserId = user.Id
            });
        }

        public Task RemoveClaimAsync(ApplicationUser user, Claim claim)
        {
            return _userData.RemoveUserClaimAsync(user.Id, claim.Type);
        }

        public Task SetEmailAsync(ApplicationUser user, string email)
        {
            return Task.FromResult(user.Email = email);
        }

        public Task<string> GetEmailAsync(ApplicationUser user)
        {
            return Task.FromResult(user.Email);
        }

        public Task<bool> GetEmailConfirmedAsync(ApplicationUser user)
        {
            return Task.FromResult(user.EmailConfirmed);
        }

        public Task SetEmailConfirmedAsync(ApplicationUser user, bool confirmed)
        {
            return Task.FromResult(user.EmailConfirmed = confirmed);
        }

        public Task<ApplicationUser> FindByEmailAsync(string email)
        {
            return _userData.FindUserByEmailAsync(email);
        }

        public Task<DateTimeOffset> GetLockoutEndDateAsync(ApplicationUser user)
        {
            return Task.FromResult(user.LockoutEndDate);
        }

        public Task SetLockoutEndDateAsync(ApplicationUser user, DateTimeOffset lockoutEnd)
        {
            return Task.FromResult(user.LockoutEndDate = lockoutEnd);
        }

        public Task<int> IncrementAccessFailedCountAsync(ApplicationUser user)
        {
            return Task.FromResult(user.AccessFailedCount += 1);
        }

        public Task ResetAccessFailedCountAsync(ApplicationUser user)
        {
            return Task.FromResult(user.AccessFailedCount = 0);
        }

        public Task<int> GetAccessFailedCountAsync(ApplicationUser user)
        {
            return Task.FromResult(user.AccessFailedCount);
        }

        public Task<bool> GetLockoutEnabledAsync(ApplicationUser user)
        {
            return Task.FromResult(user.LockoutEnabled);
        }

        public Task SetLockoutEnabledAsync(ApplicationUser user, bool enabled)
        {
            return Task.FromResult(user.LockoutEnabled = enabled);
        }

        public Task SetSecurityStampAsync(ApplicationUser user, string stamp)
        {
            return Task.FromResult(user.SecurityStamp = stamp);
        }

        public Task<string> GetSecurityStampAsync(ApplicationUser user)
        {
            return Task.FromResult(user.SecurityStamp);
        }

        public Task SetTwoFactorEnabledAsync(ApplicationUser user, bool enabled)
        {
            return Task.FromResult(user.TwoFactorEnabled = enabled);
        }

        public Task<bool> GetTwoFactorEnabledAsync(ApplicationUser user)
        {
            return Task.FromResult(user.TwoFactorEnabled);
        }
    }
}