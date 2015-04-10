using AngularTemplate.Models.Database;
using AngularTemplate.Models.Interfaces;
using AngularTemplate.Models.Stores;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Insight.Database;
using System.Web;
using System.Dynamic;

namespace AngularTemplate.Controllers
{
    [Authorize]
    [RoutePrefix("api/household")]
    public class HouseholdController : ApiController
    {
        private readonly IHouseholdDataAccess i;

        public HouseholdController()
        {
            i =  HttpContext.Current.GetOwinContext().Get<SqlConnection>().As<IHouseholdDataAccess>();
        }

        // Get
        [AllowAnonymous]
        [Route("get_Household")]
        public async Task<Household> GetHousehold()
        {
            try
            {
                var user = await i.SelectUserAsync(User.Identity.GetUserId<int>());

                //Create a Household If User has none
                Household household;
                if (user.Household == null || user.Household == 0)
                {
                    household = new Household { Id = 0, Name = user.Name + " Household" };
                    var id = await i.InsertHousehold(household);
                    user.Household = id;
                    await i.UpdateUser(user);
                }


                household = await i.SelectHousehold(user.Household);
                household.Users = await i.GetHouseholdUsers(household.Id);
                household.Accounts = await i.GetAccountsByHousehold(household.Id);
                return household;
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        // POST 
        [AllowAnonymous]
        [Route("send_household_invitation")]
        [HttpPost]
        public async Task<object> SendHouseholdInvitation(ApplicationUser userToInvite)
        {
            try
            {
                //Get logged user
                var user = await i.SelectUserAsync(User.Identity.GetUserId<int>());
                //First make sure that the user is not inviting himself or a non existent user
                var toUser = await i.FindUserByUserName(userToInvite.UserName);
                if (toUser != null)
                {
                    if(toUser.Id == user.Id)
                    {
                        return new { Succeed = false, Message = "You cannot send an invitation to yourself" };
                    }
                    
                    //Create a Household If User has none
                    if (user.Household == null || user.Household == 0)
                    {
                        var household = new { Id = 0, Name = user.Name + " Household" };
                        var id = await i.InsertHousehold(household);
                        user.Household = id;
                        await i.UpdateUser(user);
                    }

                    //Make Sure that the user does not already belong tho the household
                    if(user.Household == toUser.Household)
                    {
                        return new { Succeed = false, Message = "Email/User '" + userToInvite.UserName + "' already belongs to this household!" };
                    }

                    //Make sure that the user does not already has an invitation to that same household
                    var invis = await i.GetInvitationsBy_ForHousehold(user.Household);

                    if(invis.Count()>0)
                    {
                        return new { Succeed = false, Message = "Email/User '" + userToInvite.UserName + "' was already invited to this household!\nThe system is waiting for the user's response to the invitation." };
                    }

                    HouseholdInvitation invitation = new HouseholdInvitation();
                    invitation.FromUser_Name = user.Name;
                    invitation.ForHouseholdId = user.Household;
                    invitation.FromUserId = user.Id;
                    invitation.FromUser_UserName = user.UserName;
                    invitation.ToUserId = toUser.Id;
                    invitation.ToUser_UserName = toUser.UserName;

                    var invitationId = await i.InsertInvitation(invitation);
                    
                    if(invitationId == 0)
                    {
                        return new { Succeed = false, Message = "The invitation could not be created." };
                    }

                    return new { Succeed = true, Message = "Email/User '" + toUser.UserName + "' has been invited you household." };
                }
                else
                {
                    return new { Succeed = false, Message = "The invitation could not be sent. \nThe user does not exist!" };
                }
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        // POST 
        [AllowAnonymous]
        [Route("join_invited_household")]
        [HttpPost]
        public async Task<object> JoinAnotherUserHousehold([FromBody] int invitationId)
        {
            try
            {
                var invitation = await i.SelectInvitationAsync(invitationId);
                var fromUser = await i.FindUserByUserName(invitation.FromUser_UserName);

                //Get logged user
                var user = await i.SelectUserAsync(User.Identity.GetUserId<int>());
                user.Household = fromUser.Household;
                //Save the user with the new household
                await i.UpdateUser(user);

                //Delet the invitation
                await i.DeleteInvitationAsync(invitationId);

                return new { Succeed = true, Message = "You have been adedd to the new houshold." };
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        // POST 
        [AllowAnonymous]
        [Route("delete_household_invitation")]
        [HttpPost]
        public async Task<object> DeleteInvi([FromBody] int invitationId)
        {
            try
            {
                //Delet the invitation
                await i.DeleteInvitationAsync(invitationId);

                return new { Succeed = true, Message = "The notification has been deleted." };
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        // Get
        [AllowAnonymous]
        [Route("get_user_nitifications")]
        public async Task<IEnumerable<object>> GetUserNotifications(string username)
        {
            try
            {
                var user = await i.FindUserByUserName(username);
                List<object> notifications = new List<object>();
                var invitations = await i.GetInvitationsByToUserId(user.Id);
                notifications.AddRange(invitations);

                return notifications;
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        // POST 
        [AllowAnonymous]
        [Route("create_household_account")]
        [HttpPost]
        public async Task<HouseholdAccount> CreateAccount(HouseholdAccount acc)
        {
            try
            {
                var user = await i.SelectUserAsync(User.Identity.GetUserId<int>());
                //Create a Household If User has none
                if (user.Household == null || user.Household == 0)
                {
                    var household = new {Id=0,Name=user.Name + " Household"};
                    var id = await i.InsertHousehold(household);
                    user.Household = id;
                    await i.UpdateUser(user);
                }

                acc.HouseholdId = user.Household;
                var accid = await i.InsertAccountAsync(acc);
                acc.Id = accid;
                return acc;
            }
            catch(Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        // POST 
        [AllowAnonymous]
        [Route("update_household_account")]
        [HttpPost]
        public async Task UpdateAccount(HouseholdAccount acc)
        {
            try
            {
                await i.UpdateAccountAsync(acc);
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        // POST 
        [AllowAnonymous]
        [Route("delete_household_account")]
        [HttpPost]
        public bool DeleteAccount([FromBody] int accId)
        {
            try
            {
                i.DeleteAccountAsync(accId);
                return true;
            }
            catch (Exception e)
            {
                return false;//Will happen if the accout has transactions, because they
                //have the accounts foreign key.
                //throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        // Get
        [AllowAnonymous]
        [Route("get_user_household_accounts")]
        public async Task<IEnumerable<HouseholdAccount>> GetUserHouseHoldAccounts()
        {
            try
            {
                var id = User.Identity.GetUserId<int>();
                var user = await i.SelectUserAsync(id);
                var accounts = await i.GetAccountsByHousehold(user.Household);
                return accounts;
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        //private Task<IEnumerable<HouseholdAccount>> GetSpecificAmmounts(int itemsAmount, int page, string sortBy, string query, List<HouseholdAccount> accounts)
        //{
        //    query = query.ToLower();
        //    //Search first in every property of the objecs
        //    IEnumerable<HouseholdAccount> queryResults = accounts.Where(i => i.Name.ToLower().Contains(query));

            
        //    accounts.OrderBy(i => i.Name);
        //}

        // Get
        [AllowAnonymous]
        [Route("get_account")]
        public async Task<HouseholdAccount> GetAccount(int Id)
        {
            try
            {
                return await i.SelectAccount(Id);
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        // Get
        [AllowAnonymous]
        [Route("get_account_transactions")]
        public async Task<IEnumerable<AccountTransaction>> GetTransactions(int Id)
        {
            try
            {
                var id = User.Identity.GetUserId<int>();
                var user = await i.SelectUserAsync(id);

                //Get all categories of current household
                var catsTemp = await GetCategories();
                List<BudgetCategory> cats = catsTemp as List<BudgetCategory>;
                //Get all transactions belonging to the specific account
                var result = await i.GetTransactionsByAccountId(Id);
                //Get all household users
                var users = await i.GetHouseholdUsersAsync(user.Household);
                //Asign category to budget item
                foreach (AccountTransaction transaction in result)
                {
                    transaction.Category = cats.First(a => a.Id == transaction.CategoryId);
                    transaction.UpdatedByUser = users.FirstOrDefault(u => u.Id == transaction.UpdatedByUserId);
                    if(transaction.UpdatedByUser == null)//It means that the user left the house hold
                    {
                        //Look for it in all the users by Id
                        transaction.UpdatedByUser = await i.SelectUser(transaction.UpdatedByUserId);
                    }
                }

                return result;
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        //// Get
        //[AllowAnonymous]
        //[Route("get_last_transactions")]
        //public async Task<IEnumerable<AccountTransaction>> GetLatestTransactions()
        //{
        //    try
        //    {
        //        var id = User.Identity.GetUserId<int>();
        //        var user = await i.SelectUserAsync(id);

        //        //Get accounts
        //        var accounts = await i.GetAccountsByHousehold(user.Household);

        //        //Start getting transactions from the accounts until you have the number 
        //        //of transactions desired
                
        //        List<AccountTransaction> allTransactions = new List<AccountTransaction>();
        //        foreach(HouseholdAccount acc in accounts)
        //        {
        //            var t = (await i.GetTransactionsToALimitByAccountId(acc.Id) as List<AccountTransaction>);
        //            foreach (AccountTransaction tr in t)
        //            {
        //                tr.Account = acc;
        //                allTransactions.Add(tr);
        //            }
        //        }

        //        allTransactions.Sort((x, y) => y.Updated.CompareTo(x.Updated));//Ordare by date decending
        //        int cont = allTransactions.Count;
        //        int grab = 0;
        //        if (cont >= 7){grab = 7;}
        //        else{grab = cont;}
        //        var result = new List<AccountTransaction>();
        //        for (int a = 0; a < grab; a++)
        //        {
        //            result.Add(allTransactions[a]);
        //        }

        //        return result as IEnumerable<AccountTransaction>;
        //    }
        //    catch (Exception e)
        //    {
        //        throw new HttpResponseException(HttpStatusCode.BadRequest);
        //    }
        //}

        // Get
        [AllowAnonymous]
        [Route("get_12_months_history")]
        public async Task<object> GetLast12Months()
        {
            try
            {
                var id = User.Identity.GetUserId<int>();
                var user = await i.SelectUserAsync(id);

                //Get accounts
                var accounts = await i.GetAccountsByHousehold(user.Household);

                //Start getting transactions from the accounts until you have the number 
                //of transactions desired

                List<AccountTransaction> allTransactions = new List<AccountTransaction>();
                var temp = DateTimeOffset.Now;
                var maxDate = new DateTimeOffset(temp.Year, temp.Month, temp.Day, temp.Hour, temp.Minute, temp.Second, temp.Offset);
                //Calculate 12 months ago
                var minMonth = temp.Month + 1;
                if (minMonth > 12)
                {
                    minMonth = 1;
                }
                var minYear = temp.Year;
                if(12 - temp.Month>0)
                {
                    minYear -= 1;
                }


                var minDate = new DateTimeOffset(minYear, minMonth, 1, 0, 0, 0, temp.Offset);
                
                foreach (HouseholdAccount acc in accounts)
                {
                    var t = (await i.GetTransactionByAccountAndDateRange(acc.Id, maxDate, minDate) as List<AccountTransaction>);
                    foreach (AccountTransaction tr in t)
                    {
                        tr.Account = acc;
                        allTransactions.Add(tr);
                    }
                }

                allTransactions.Sort((x, y) => y.Date.CompareTo(x.Date));//Ordare by date decending
                int cont = allTransactions.Count;
                int grab = 0;
                if (cont >= 7) { grab = 7; }
                else { grab = cont; }
                var seven_trans = new List<AccountTransaction>();
                for (int a = 0; a < grab; a++)
                {
                    seven_trans.Add(allTransactions[a]);
                }


                //Calculate spendings versus budget for each month's transactions
                var months = new Dictionary<int, List<AccountTransaction>>();
                foreach(AccountTransaction tr in allTransactions)
                {

                    if(!months.ContainsKey(tr.Date.Month))
                    {
                        months.Add(tr.Date.Month, new List<AccountTransaction>());
                    }
                    months[tr.Date.Month].Add(tr);
                }

                var monthItems = months.ToList();

                //Order each entry by year and month
                monthItems.Sort((x, y) => x.Value[0].Updated.CompareTo(y.Value[0].Updated));

                var result = new { 
                    Latest_SevenTransactions = seven_trans,
                    MontlyTransactions = monthItems

                };

                return result;
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        [AllowAnonymous]
        [Route("create_transaction")]
        [HttpPost]
        public async Task<AccountTransaction> CreateNewTransaction(AccountTransaction transaction)
        {
            try
            {
                var id = User.Identity.GetUserId<int>();
                var user = await i.SelectUserAsync(id);

                //Get or create the category
                transaction.Category = await CreateNewCategory(transaction.Category);
                transaction.CategoryId = transaction.Category.Id;
                transaction.UpdatedByUserId = id;

                transaction.UpdatedByUser = user;

                transaction.Id = await i.InsertTransactionAsync(transaction);
                return transaction;
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        [AllowAnonymous]
        [Route("delete_transaction")]
        [HttpPost]
        public async Task DeleteTransaction(AccountTransaction transaction)
        {
            try
            {
                await i.DeleteTransaction(transaction.Id, transaction.AccountId, transaction.IsCredit, transaction.Amount, transaction.ReconciledAmount);
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        [AllowAnonymous]
        [Route("update_transaction")]
        [HttpPost]
        public async Task<AccountTransaction> UpdateTransaction(AccountTransaction transaction)
        {
            try
            {
                var id = User.Identity.GetUserId<int>();
                var user = await i.SelectUserAsync(id);
                //Get or create the category
                transaction.Category = await CreateNewCategory(transaction.Category);
                transaction.CategoryId = transaction.Category.Id;
                transaction.UpdatedByUserId = id;
                transaction.UpdatedByUser = user;
                transaction.Id = await i.UpdateTransactionAsync(transaction);
                
                return transaction;
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        // Get
        [AllowAnonymous]
        [Route("get_categories")]
        public async Task<IEnumerable<BudgetCategory>> GetCategories()
        {
            try
            {
                var id = User.Identity.GetUserId<int>();
                var user = await i.SelectUserAsync(id);
                var categories = await i.GetHouseholdCategoriesAsync(user.Household);
                return categories;
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        //// POST 
        //[AllowAnonymous]
        //[Route("create_category")]
        //[HttpPost]
        //public async Task<BudgetCategory> CreateNewCategory(BudgetCategory newCat)
        //{
        //    try
        //    {
        //        //Check if it allready exists
        //        var result = await i.GetCategoryByNameAsync(newCat.Name);
        //        bool exists = false;
        //        foreach(var item in result)
        //        {
        //            if(item.Name == newCat.Name)
        //            {
        //                exists = true;
        //                break;
        //            }
        //        }
        //        if (exists == false)
        //        {
        //            var id = User.Identity.GetUserId<int>();
        //            var user = await i.SelectUserAsync(id);
        //            newCat.HouseholdId = user.Household;
        //            newCat.Id = await i.InsertCategoryAsync(newCat);
        //            return newCat;
        //        }
        //        return null;//Did not need to creat it because it exists
        //    }
        //    catch (Exception e)
        //    {
        //        throw new HttpResponseException(HttpStatusCode.BadRequest);
        //    }
        //}



        // POST 


        // POST 


        
        public async Task<BudgetCategory> CreateNewCategory(BudgetCategory newCat)
        {

            var id = User.Identity.GetUserId<int>();
            var user = await i.SelectUserAsync(id);
                //Check if it allready exists
            var result = await i.GetCategoryByNameAndHouseholdAsync(newCat.Name, user.Household);
                bool exists = false;
                foreach (var item in result)
                {
                    if (item.Name == newCat.Name)
                    {
                        newCat = item;
                        exists = true;
                        break;
                    }
                }
                if (exists == false)
                {
                    
                    newCat.HouseholdId = user.Household;
                    newCat.Id = await i.InsertCategoryAsync(newCat);
                    return newCat;
                }
                return newCat;
        }


        [AllowAnonymous]
        [Route("create_budgetItem")]
        [HttpPost]
        public async Task<BudgetItem> CreateNewBudgetItem(BudgetItem budgetI)
        {
            try
            {
                var id = User.Identity.GetUserId<int>();
                var user = await i.SelectUserAsync(id);
                budgetI.HouseholdId = user.Household;
                budgetI.Category.HouseholdId = user.Household;
                //Get or create the category
                budgetI.Category = await CreateNewCategory(budgetI.Category);
                budgetI.CategoryId = budgetI.Category.Id;
                budgetI.Id = await i.InsertBudgetItemAsync(budgetI);

                return budgetI;
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        [AllowAnonymous]
        [Route("delete_budgetItem")]
        [HttpPost]
        public async Task DeleteBudgetItem([FromBody] int itemId)
        {
            try
            {
                await i.DeleteBudgetItemAsync(itemId);
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }

        // Get
        [AllowAnonymous]
        [Route("get_budgetItems")]
        public async Task<IEnumerable<object>> GetBudgetItems()
        {
            try
            {
                var id = User.Identity.GetUserId<int>();
                var user = await i.SelectUserAsync(id);

                //Get all categories of current household
               List<BudgetCategory> cats = (await GetCategories() as List<BudgetCategory>);
                //Get all budget Items
               List<BudgetItem> budgItems = (await i.GetBudgetItemsByHouseholdAsync(user.Household) as List<BudgetItem>);

                //Asign category to budget item
               foreach (BudgetItem bt in budgItems)
               {
                   bt.Category = cats.FirstOrDefault(a => a.Id == bt.CategoryId);
               }

                //Separate Expenses from Income
               IEnumerable<BudgetItem> expenses = budgItems.Where(t => t.Type == "Expense");
               IEnumerable<BudgetItem> income = budgItems.Where(t => t.Type == "Income");
               
               List<object> l = new List<object>() { income, expenses };

               return l;
            }
            catch (Exception e)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
        }
    }
}
