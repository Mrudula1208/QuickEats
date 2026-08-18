using System.Net;
using System.Text.Json;
using QuickEats.API.Exceptions;
using QuickEats.API.Responses;

namespace QuickEats.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var (statusCode, message) = exception switch
            {
                BadRequestException ex =>
                    (HttpStatusCode.BadRequest, ex.Message),

                UnauthorizedAppException ex =>
                    (HttpStatusCode.Unauthorized, ex.Message),

                ForbiddenException ex =>
                    (HttpStatusCode.Forbidden, ex.Message),

                NotFoundException ex =>
                    (HttpStatusCode.NotFound, ex.Message),

                ArgumentException ex =>
                    (HttpStatusCode.BadRequest, ex.Message),

                InvalidOperationException ex =>
                    (HttpStatusCode.Conflict, ex.Message),

                _ =>
                    (HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.")
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var response = new ApiErrorResponse
            {
                Message = message
            };

            var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(json);
        }
    }
}
