using WagenheimerDotCom.Components;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveWebAssemblyComponents()
    .AddInteractiveServerComponents();

builder.Services.AddSingleton<WagenheimerDotCom.Services.IBlogService, WagenheimerDotCom.Services.MarkdownBlogService>();
builder.Services.AddSingleton<WagenheimerDotCom.Services.IGameService, WagenheimerDotCom.Services.MarkdownGameService>();
builder.Services.AddScoped<WagenheimerDotCom.Services.IContactService, WagenheimerDotCom.Services.ContactService>();
builder.Services.AddScoped<WagenheimerDotCom.Services.IHighScoreService, WagenheimerDotCom.Services.HighScoreService>();
builder.Services.AddScoped<WagenheimerDotCom.Services.ICommentService, WagenheimerDotCom.Services.CommentService>();
builder.Services.AddLocalization();
// ... (Auth setup unchanged) ...

// ...

// (Removed redundant block)

builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/admin/login";
        options.ExpireTimeSpan = TimeSpan.FromDays(30);
    });
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseWebAssemblyDebugging();
}
else
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

var supportedCultures = new[] { "en", "pt" };
var localizationOptions = new RequestLocalizationOptions()
    .SetDefaultCulture("en")
    .AddSupportedCultures(supportedCultures)
    .AddSupportedUICultures(supportedCultures);

app.UseRequestLocalization(localizationOptions);

app.UseAuthentication();
app.UseAuthorization();

app.UseAntiforgery();

app.UseStaticFiles();
app.MapStaticAssets();
app.MapControllers();
app.MapRazorComponents<App>()
    .AddInteractiveWebAssemblyRenderMode()
    .AddInteractiveServerRenderMode()
    .AddAdditionalAssemblies(typeof(WagenheimerDotCom.Client._Imports).Assembly);

app.Run();
