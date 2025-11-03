var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        ctx.Context.Response.Headers["Pragma"] = "no-cache";
        ctx.Context.Response.Headers["Expires"] = "0";
    }
});
app.UseHttpsRedirection();

string[] languages = ["en", "ru", "kr"];

foreach (var lang in languages) {
    app.MapGet($"/home-{lang}", async context => {
        var html = File.ReadAllText($"html/home-{lang}.html");
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.WriteAsync(html);
    });
}
foreach (var lang in languages) {
    app.MapGet($"/builds-{lang}", async context => {
        var html = File.ReadAllText($"html/builds-{lang}.html");
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.WriteAsync(html);
    });
}
foreach (var lang in languages) {
    app.MapGet($"/mw-builds-wz-affix-{lang}", async context => {
        var html = File.ReadAllText($"html/mw-builds-wz-affix-{lang}.html");
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.WriteAsync(html);
    });
}
foreach (var lang in languages) {
    app.MapGet($"/mw-builds-wz-element-{lang}", async context => {
        var html = File.ReadAllText($"html/mw-builds-wz-element-{lang}.html");
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.WriteAsync(html);
    });
}
foreach (var lang in languages) {
    app.MapGet($"/mechanics-{lang}", async context => {
        var html = File.ReadAllText($"html/mechanics-{lang}.html");
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.WriteAsync(html);
    });
}

app.Run();