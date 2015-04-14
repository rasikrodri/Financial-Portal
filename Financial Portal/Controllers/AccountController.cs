using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using AngularTemplate.Models;
using AngularTemplate.Providers;
using AngularTemplate.Results;
using AngularTemplate.Models.Database;
using System.Data.SqlClient;
using AngularTemplate.Models.Interfaces;
using Insight.Database;
using System.Text;
using System.Collections;
using System.Net.Mail;
using System.Net;
using System.Web.Http.Routing;

namespace AngularTemplate.Controllers
{
    [Authorize]
    [RoutePrefix("api/Account")]
    public class AccountController : ApiController
    {
        private const string LocalLoginProvider = "Local";
        private ApplicationUserManager _userManager;

        private readonly IUserDataAccess i;

        public AccountController()
        {
            i = HttpContext.Current.GetOwinContext().Get<SqlConnection>().As<IUserDataAccess>();
        }

        public AccountController(ApplicationUserManager userManager,
            ISecureDataFormat<AuthenticationTicket> accessTokenFormat)
        {
            UserManager = userManager;
            AccessTokenFormat = accessTokenFormat;
        }

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? Request.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }
        public ISecureDataFormat<AuthenticationTicket> AccessTokenFormat { get; private set; }

        // GET api/Account/UserInfo
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("UserInfo")]
        public UserInfoViewModel GetUserInfo()
        {
            ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

            return new UserInfoViewModel
            {
                Email = User.Identity.GetUserName(),
                HasRegistered = externalLogin == null,
                LoginProvider = externalLogin != null ? externalLogin.LoginProvider : null
            };
        }

        // POST api/Account/Logout
        [Route("Logout")]
        public IHttpActionResult Logout()
        {
            Authentication.SignOut(CookieAuthenticationDefaults.AuthenticationType);
            return Ok();
        }

        // GET api/Account/ManageInfo?returnUrl=%2F&generateState=true
        [Route("ManageInfo")]
        public async Task<ManageInfoViewModel> GetManageInfo(string returnUrl, bool generateState = false)
        {
            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId<int>());

            if (user == null)
            {
                return null;
            }

            //List<UserLoginInfoViewModel> logins = new List<UserLoginInfoViewModel>();

            //foreach (IdentityUserLogin linkedAccount in user.Logins)
            //{
            //    logins.Add(new UserLoginInfoViewModel
            //    {
            //        LoginProvider = linkedAccount.LoginProvider,
            //        ProviderKey = linkedAccount.ProviderKey
            //    });
            //}

            //if (user.PasswordHash != null)
            //{
            //    logins.Add(new UserLoginInfoViewModel
            //    {
            //        LoginProvider = LocalLoginProvider,
            //        ProviderKey = user.UserName,
            //    });
            //}

            return new ManageInfoViewModel
            {
                LocalLoginProvider = LocalLoginProvider,
                Email = user.UserName,
                //Logins = logins,
                ExternalLoginProviders = GetExternalLogins(returnUrl, generateState)
            };
        }

        // POST api/Account/ChangePassword
        [HttpPost]
        //[HostAuthentication(DefaultAuthenticationTypes.ExternalCookie)]
        [Route("ChangePassword")]
        public async Task<IHttpActionResult> ChangePassword(ChangePasswordBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityResult result = await UserManager.ChangePasswordAsync(User.Identity.GetUserId<int>(), model.OldPassword,
                model.NewPassword);
                        
            if (!result.Succeeded)
            {
                ModelState.AddModelError("model.OldPassword", "Incorrect Password.");
                return BadRequest(ModelState);
            }

            return Ok();
        }

        // POST api/Account/SetPassword
        [Route("SetPassword")]
        public async Task<IHttpActionResult> SetPassword(SetPasswordBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityResult result = await UserManager.AddPasswordAsync(User.Identity.GetUserId<int>(), model.NewPassword);

            if (!result.Succeeded)
            {
                return GetErrorResult(result);
            }

            return Ok();
        }

        // POST api/Account/AddExternalLogin
        [Route("AddExternalLogin")]
        public async Task<IHttpActionResult> AddExternalLogin(AddExternalLoginBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);

            AuthenticationTicket ticket = AccessTokenFormat.Unprotect(model.ExternalAccessToken);

            if (ticket == null || ticket.Identity == null || (ticket.Properties != null
                && ticket.Properties.ExpiresUtc.HasValue
                && ticket.Properties.ExpiresUtc.Value < DateTimeOffset.UtcNow))
            {
                return BadRequest("External login failure.");
            }

            ExternalLoginData externalData = ExternalLoginData.FromIdentity(ticket.Identity);

            if (externalData == null)
            {
                return BadRequest("The external login is already associated with an account.");
            }

            IdentityResult result = await UserManager.AddLoginAsync(User.Identity.GetUserId<int>(),
                new UserLoginInfo(externalData.LoginProvider, externalData.ProviderKey));

            if (!result.Succeeded)
            {
                return GetErrorResult(result);
            }

            return Ok();
        }

        // POST api/Account/RemoveLogin
        [Route("RemoveLogin")]
        public async Task<IHttpActionResult> RemoveLogin(RemoveLoginBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityResult result;

            if (model.LoginProvider == LocalLoginProvider)
            {
                result = await UserManager.RemovePasswordAsync(User.Identity.GetUserId<int>());
            }
            else
            {
                result = await UserManager.RemoveLoginAsync(User.Identity.GetUserId<int>(),
                    new UserLoginInfo(model.LoginProvider, model.ProviderKey));
            }

            if (!result.Succeeded)
            {
                return GetErrorResult(result);
            }

            return Ok();
        }

        // GET api/Account/ExternalLogin
        [OverrideAuthentication]
        [HostAuthentication(DefaultAuthenticationTypes.ExternalCookie)]
        [AllowAnonymous]
        [Route("ExternalLogin", Name = "ExternalLogin")]
        public async Task<IHttpActionResult> GetExternalLogin(string provider, string error = null)
        {
            if (error != null)
            {
                return Redirect(Url.Content("~/") + "#error=" + Uri.EscapeDataString(error));
            }

            if (!User.Identity.IsAuthenticated)
            {
                return new ChallengeResult(provider, this);
            }

            ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

            if (externalLogin == null)
            {
                return InternalServerError();
            }

            if (externalLogin.LoginProvider != provider)
            {
                Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
                return new ChallengeResult(provider, this);
            }

            ApplicationUser user = await UserManager.FindAsync(new UserLoginInfo(externalLogin.LoginProvider,
                externalLogin.ProviderKey));

            bool hasRegistered = user != null;

            if (hasRegistered)
            {
                Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
                
                 ClaimsIdentity oAuthIdentity = await user.GenerateUserIdentityAsync(UserManager,
                    OAuthDefaults.AuthenticationType);
                ClaimsIdentity cookieIdentity = await user.GenerateUserIdentityAsync(UserManager,
                    CookieAuthenticationDefaults.AuthenticationType);

                AuthenticationProperties properties = ApplicationOAuthProvider.CreateProperties(user, UserManager);
                Authentication.SignIn(properties, oAuthIdentity, cookieIdentity);
            }
            else
            {
                IEnumerable<Claim> claims = externalLogin.GetClaims();
                ClaimsIdentity identity = new ClaimsIdentity(claims, OAuthDefaults.AuthenticationType);
                Authentication.SignIn(identity);
            }

            return Ok();
        }

        // GET api/Account/ExternalLogins?returnUrl=%2F&generateState=true
        [AllowAnonymous]
        [Route("ExternalLogins")]
        public IEnumerable<ExternalLoginViewModel> GetExternalLogins(string returnUrl, bool generateState = false)
        {
            IEnumerable<AuthenticationDescription> descriptions = Authentication.GetExternalAuthenticationTypes();
            List<ExternalLoginViewModel> logins = new List<ExternalLoginViewModel>();

            string state;

            if (generateState)
            {
                const int strengthInBits = 256;
                state = RandomOAuthStateGenerator.Generate(strengthInBits);
            }
            else
            {
                state = null;
            }

            foreach (AuthenticationDescription description in descriptions)
            {
                ExternalLoginViewModel login = new ExternalLoginViewModel
                {
                    Name = description.Caption,
                    Url = Url.Route("ExternalLogin", new
                    {
                        provider = description.AuthenticationType,
                        response_type = "token",
                        client_id = Startup.PublicClientId,
                        redirect_uri = new Uri(Request.RequestUri, returnUrl).AbsoluteUri,
                        state = state
                    }),
                    State = state
                };
                logins.Add(login);
            }

            return logins;
        }

        // POST api/Account/Register
        [AllowAnonymous]
        [Route("Register")]
        public async Task<IHttpActionResult> Register(RegisterBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = new ApplicationUser() { Name = model.Name, UserName = model.Email, Email = model.Email };            

            IdentityResult result = await UserManager.CreateAsync(user, model.Password);
            
            if (!result.Succeeded)
            {
                return GetErrorResult(result);
            }

            string token = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
            user.AccountConfirmationToken = token;

            var i = HttpContext.Current.GetOwinContext().Get<SqlConnection>().As<IHouseholdDataAccess>();
            await i.UpdateUser(user);

            //HttpServerUtility.un
            var url = Url.Link("OnePageAplication", new { state = "account_confirmed", token = token, email = user.Email });
            //var url = Url.Link("Default", new { Controller = "#/common", Action = "account_confirmed", activationToken = token });
            //Replace the first '%23' with '#' because it gets automatically converted to '%23'
            int start = url.IndexOf("%23");
            url = url.Substring(0, start) + "#" + url.Substring(start + 3);
            SendEmail("Activate your account", "Activate your account by clicking <a href=\"" + url + "\">here</a>", user.Email, true);

            return Ok();
        }

        // POST api/Account/Register
        [AllowAnonymous]
        [Route("is_account_confirmed")]
        public async Task<string> GetIfAccountIsConfirmed(string username)
        {
            var user = await i.FindUserByUserNameAsync(username);
            //var user = await i.FindUserByActivationToken(confirmObj.token);

            if (user == null)
            {
                return "ERROR!, Make sure you are a registered user and that you have confirmed your email adress!";
            }

            if(user.EmailConfirmed == false)
            {
                return "ERROR!, Make sure you are a registered user and that you have confirmed your email adress!";
            }

            return "OK";
        }

        public class emailConfirm
        {
            public string token{ get; set; }
            public string email { get; set; }
        }
        // POST api/Account/Register
        [AllowAnonymous]
        [HttpPost]
        [Route("confirm_user")]
        public async Task<string> ConfirmUserFromEmailLink(emailConfirm confirmObj)
        {

            var user = await i.FindUserByActivationToken(confirmObj.token);

            if (user == null || user.Email != confirmObj.email)
            {
                return "ERROR";
                //return "Invalid user";
            }


            user.EmailConfirmed = true;
            user.AccountConfirmationToken = "";

            var h = HttpContext.Current.GetOwinContext().Get<SqlConnection>().As<IHouseholdDataAccess>();
            await h.UpdateUser(user);

            return "OK";
        }
        

        // POST api/Account/Register
        //[AllowAnonymous]
        [HttpPost]
        [Route("update_user_info")]
        public async Task<string> UpdateUserInformaition(UserInfo userInfo)
        {
            //get user by username
            var i = HttpContext.Current.GetOwinContext().Get<SqlConnection>().As<IHouseholdDataAccess>();
            var user = await i.SelectUserAsync(User.Identity.GetUserId<int>());

            user.Name = userInfo.Name;

            //string activationToken = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
            //user.AccountActivationToken = activationToken;


            await i.UpdateUser(user);

            
            ////var callbackUrl = Url.Route("confirm_user", code);
            //var url = Url.Link("Default", new { Controller = "api/Account", Action = "confirm_user/", activationToken = activationToken });
            //SendEmail("Activate your account", "Activate your account by clicking <a href=\"" + url + "\">here</a>", "rasikrodri@gmail.com", true);

            

            return "Your information has been updated";
        }
        

        

        // POST api/Account/RegisterExternal
        [OverrideAuthentication]
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("RegisterExternal")]
        public async Task<IHttpActionResult> RegisterExternal(RegisterExternalBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var info = await Authentication.GetExternalLoginInfoAsync();
            if (info == null)
            {
                return InternalServerError();
            }

            var user = new ApplicationUser() { UserName = model.Email, Email = model.Email };

            IdentityResult result = await UserManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                return GetErrorResult(result);
            }

            result = await UserManager.AddLoginAsync(user.Id, info.Login);
            if (!result.Succeeded)
            {
                return GetErrorResult(result); 
            }
            return Ok();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && _userManager != null)
            {
                _userManager.Dispose();
                _userManager = null;
            }

            base.Dispose(disposing);
        }

        #region Helpers

        private IAuthenticationManager Authentication
        {
            get { return Request.GetOwinContext().Authentication; }
        }

        private IHttpActionResult GetErrorResult(IdentityResult result)
        {
            if (result == null)
            {
                return InternalServerError();
            }

            if (!result.Succeeded)
            {
                if (result.Errors != null)
                {
                    foreach (string error in result.Errors)
                    {
                        ModelState.AddModelError("", error);
                    }
                }

                if (ModelState.IsValid)
                {
                    // No ModelState errors are available to send, so just return an empty BadRequest.
                    return BadRequest();
                }

                return BadRequest(ModelState);
            }

            return null;
        }

        private class ExternalLoginData
        {
            public string LoginProvider { get; set; }
            public string ProviderKey { get; set; }
            public string UserName { get; set; }

            public IList<Claim> GetClaims()
            {
                IList<Claim> claims = new List<Claim>();
                claims.Add(new Claim(ClaimTypes.NameIdentifier, ProviderKey, null, LoginProvider));

                if (UserName != null)
                {
                    claims.Add(new Claim(ClaimTypes.Name, UserName, null, LoginProvider));
                }

                return claims;
            }

            public static ExternalLoginData FromIdentity(ClaimsIdentity identity)
            {
                if (identity == null)
                {
                    return null;
                }

                Claim providerKeyClaim = identity.FindFirst(ClaimTypes.NameIdentifier);

                if (providerKeyClaim == null || String.IsNullOrEmpty(providerKeyClaim.Issuer)
                    || String.IsNullOrEmpty(providerKeyClaim.Value))
                {
                    return null;
                }

                if (providerKeyClaim.Issuer == ClaimsIdentity.DefaultIssuer)
                {
                    return null;
                }

                return new ExternalLoginData
                {
                    LoginProvider = providerKeyClaim.Issuer,
                    ProviderKey = providerKeyClaim.Value,
                    UserName = identity.FindFirstValue(ClaimTypes.Name)
                };
            }
        }

        private static class RandomOAuthStateGenerator
        {
            private static RandomNumberGenerator _random = new RNGCryptoServiceProvider();

            public static string Generate(int strengthInBits)
            {
                const int bitsPerByte = 8;

                if (strengthInBits % bitsPerByte != 0)
                {
                    throw new ArgumentException("strengthInBits must be evenly divisible by 8.", "strengthInBits");
                }

                int strengthInBytes = strengthInBits / bitsPerByte;

                byte[] data = new byte[strengthInBytes];
                _random.GetBytes(data);
                return HttpServerUtility.UrlTokenEncode(data);
            }
        }

        private void SendEmail(string subject, string body, string _emailTo,  bool _isBodyHTML = false, string _emailFrom = "rasikfinancialportal@gmail.com", List<string> _attachements = null)
        {
            MailMessage mail = new MailMessage(_emailFrom, _emailTo, subject, body);//"support@rasikfinancialportal.com.pk";
            mail.IsBodyHtml = _isBodyHTML;

            //Attachements
            if (_attachements != null)
            {
                foreach (string att in _attachements)
                {
                    System.Net.Mail.Attachment attachment;
                    attachment = new System.Net.Mail.Attachment(att);//the adress to the file
                    mail.Attachments.Add(attachment);
                }
            }

            //port could be 25
            SmtpClient smtp = new SmtpClient
            {
                Host = "smtp.gmail.com",
                Port = 587,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Credentials = new NetworkCredential("rasikfinancialportal@gmail.com", "Rodr1ras1k1!"),
                Timeout = 3000
            };

            smtp.Send(mail);
        }

        #endregion
    }
}
