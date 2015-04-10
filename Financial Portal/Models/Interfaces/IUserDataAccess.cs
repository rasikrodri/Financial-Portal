using System.Collections.Generic;
using System.Threading.Tasks;
using AngularTemplate.Models;
using Insight.Database;

namespace AngularTemplate.Models.Database
{
    [Sql(Schema = "Security")]
    public interface IUserDataAccess
    {
        Task<ApplicationUser> FindUserByUserNameAsync(string userName);
        Task<bool> IsUserInRoleAsync(int userId, string role);
        Task<IList<string>> GetRolesForUserAsync(int userId);
        Task RemoveUserFromRoleAsync(int userId, string role);
        Task<IList<UserLogin>> GetLoginsForUserAsync(int userId);
        Task<ApplicationUser> FindUserByLoginAsync(string loginProvider, string providerKey);
        Task<IList<UserClaim>> GetUserClaimsAsync(int userId);
        Task<ApplicationUser> FindUserByEmailAsync(string email);
        Task RemoveUserClaimAsync(int userId, string claimType);
        Task<bool> AddUserToRoleAsync(int userId, string role);
        Task<ApplicationUser> FindUserByActivationToken(string activationToken);

        // auto procs
        Task<ApplicationUser> SelectUserAsync(int id);
        Task DeleteUserAsync(int id);
        Task UpdateUserAsync(ApplicationUser user);
        Task InsertUserAsync(ApplicationUser user);
        Task InsertUserLoginAsync(UserLogin userLogin);
        Task DeleteUserLoginAsync(UserLogin login);
        Task InsertUserClaimAsync(UserClaim claim);

        

    }
    
}