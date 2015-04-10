namespace AngularTemplate.Models.Database
{
    public class UserLogin
    {
        public int UserId { get; set; }
        public string LoginProvider { get; set; }
        public string ProviderKey { get; set; }
    }
}