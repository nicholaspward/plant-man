using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using plant_manager.Data;

namespace plant_manager.Endpoints
{
    internal static class EndpointHelpers
    {
        public static IResult BadRequest(string error) =>
            Results.BadRequest(new { error });

        public static IResult Conflict(string error) =>
            Results.Conflict(new { error });

        public static string? NormalizeOptional(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        public static bool TryNormalizeRequired(string? value, string error, out string normalized, out IResult? result)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                normalized = string.Empty;
                result = BadRequest(error);
                return false;
            }

            normalized = value.Trim();
            result = null;
            return true;
        }

        public static async Task<bool> NameExistsAsync<TEntity>(
            this ApplicationDbContext db,
            Expression<Func<TEntity, bool>> predicate)
            where TEntity : class =>
            await db.Set<TEntity>().AnyAsync(predicate);
    }
}
