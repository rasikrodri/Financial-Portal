using AngularTemplate.Models.Database;
using AngularTemplate.Models.Stores;
using Insight.Database;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace AngularTemplate.Models.Interfaces
{
    [Sql(Schema = "Security")]
    public interface IHouseholdDataAccess
    {
        Task<ApplicationUser> FindUserByUserName(string username);
        Task<IEnumerable<HouseholdAccount>> GetAccountsByUserId(int userId);
        Task<List<HouseholdAccount>> GetAccountsByHousehold(int householdId);
        Task<IEnumerable<BudgetCategory>> GetHouseholdCategoriesAsync(int householdId);
        Task<IEnumerable<BudgetCategory>> GetCategoryByNameAndHouseholdAsync(string name, int householdId);
        Task<IEnumerable<BudgetItem>> GetBudgetItemsByHouseholdAsync(int householdId);
        Task<IEnumerable<AccountTransaction>> GetTransactionsByAccountId(int accountId);
        Task<IEnumerable<ApplicationUser>> GetHouseholdUsersAsync(int householdId);
        Task<IEnumerable<HouseholdInvitation>> GetInvitationsByToUserId(int toUserId);

        // auto procs
        Task<int> InsertAccountAsync(HouseholdAccount account);
        Task UpdateAccountAsync(HouseholdAccount acc);
        void DeleteAccountAsync(int Id);
        Task<ApplicationUser> SelectUserAsync(int Id);
        Task<int> InsertHousehold(object household);
        Task UpdateUser(ApplicationUser user);
        Task<int> InsertCategoryAsync(BudgetCategory cat);
        Task<int> InsertBudgetItemAsync(BudgetItem budgetI);
        Task<HouseholdAccount> SelectAccount(int Id);
        Task<int> SelectTransaction(int Id);
        Task<int> InsertTransactionAsync(AccountTransaction t);
        Task<int> UpdateTransactionAsync(AccountTransaction t);
        Task DeleteBudgetItemAsync(int Id);
        Task DeleteTransaction(int Id, int AccountId, bool isCredit, double amount, double reconciledamount);
        Task<Household> SelectHousehold(int Id);
        Task<IEnumerable<ApplicationUser>> GetHouseholdUsers(int householdId);

        Task<int> InsertInvitation(HouseholdInvitation invitation);

        Task<IEnumerable<HouseholdInvitation>> GetInvitationsBy_ForHousehold(int forHouseholdId);



        Task<HouseholdInvitation> SelectInvitationAsync(int Id);

        Task DeleteInvitationAsync(int Id);

        Task<IEnumerable<AccountTransaction>> GetTransactionsToALimitByAccountId(int accoutId);

        Task<List<AccountTransaction>> GetTransactionByAccountAndDateRange(int accountId, DateTimeOffset maxDate, DateTimeOffset minDate);

        Task<ApplicationUser> SelectUser(int Id);

        
    }
}