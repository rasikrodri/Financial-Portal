using System;
using System.Collections;
using System.Collections.Generic;
namespace AngularTemplate.Models.Database
{

    public class Household
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IEnumerable<ApplicationUser> Users { get; set; }
        public IEnumerable<HouseholdAccount> Accounts { get; set; }
    }
    public class HouseholdInvitation
    {
        public int Id { get; set; }
        public int ForHouseholdId { get; set; }
        public int FromUserId { get; set; }
        public string FromUser_Name { get; set; }        
        public string FromUser_UserName { get; set; }
        public int ToUserId { get; set; }
        public string ToUser_UserName { get; set; }
    }

    public class HouseholdAccount
    {
        public string UserName { get; set; }
        public IEnumerable<AccountTransaction> Transactions { get; set; }

        public int Id { get; set; }
        public int HouseholdId { get; set; }
        public string Name { get; set; }
        public double Balance { get; set; }
        public double ReconciledBalance { get; set; }
    }

    public class AccountTransaction
    {
        public int Id { get; set; }
        public int AccountId { get; set; }
        public bool IsCredit { get; set; }
        public double Amount { get; set; }
        public double AbsAmount { get; set; }
        public double ReconciledAmount { get; set; }
        public double AbsReconciledAmount { get; set; }
        public DateTimeOffset Date { get; set; }
        public string Description { get; set; }
        public DateTimeOffset Updated { get; set; }
        public int UpdatedByUserId { get; set; }
        public int CategoryId { get; set; }

        ///// <summary>
        ///// If I don't have this I will get a 500 server error when returning a list of it from the api
        ///// </summary>
        //public AccountTransaction()
        //{
        //}


        public ApplicationUser UpdatedByUser { get; set; }
        public BudgetCategory Category { get; set; }
        public HouseholdAccount Account { get; set; }
    }

    public class BudgetItem
    {
        public string UserName { get; set; }

        public int Id { get; set; }
        public int HouseholdId { get; set; }
        public string Type { get; set; }
        public int CategoryId { get; set; }

        public BudgetCategory Category { get; set; }

        public string Description { get; set; }
        public double Amount { get; set; }
        public int AnualFrequency { get; set; }
    }

    public class BudgetCategory
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int HouseholdId { get; set; }
    }
}