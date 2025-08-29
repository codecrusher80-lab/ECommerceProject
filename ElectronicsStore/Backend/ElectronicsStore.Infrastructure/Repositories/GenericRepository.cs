using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Infrastructure.Data;

namespace ElectronicsStore.Infrastructure.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public GenericRepository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual async Task<T?> GetByIdAsync(string id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.FirstOrDefaultAsync(predicate);
        }

        public virtual async Task<PagedResult<T>> GetPagedAsync(PaginationParams parameters)
        {
            return await GetPagedAsync(parameters, null);
        }

        public virtual async Task<PagedResult<T>> GetPagedAsync(PaginationParams parameters, Expression<Func<T, bool>>? predicate)
        {
            var query = _dbSet.AsQueryable();

            if (predicate != null)
                query = query.Where(predicate);

            if (!string.IsNullOrEmpty(parameters.SearchTerm))
            {
                // This is a basic implementation. Override in specific repositories for proper search
                var searchTerm = parameters.SearchTerm.ToLower();
                // Add specific search logic in derived repositories
            }

            var totalCount = await query.CountAsync();

            if (!string.IsNullOrEmpty(parameters.SortBy))
            {
                if (parameters.SortDescending)
                    query = query.OrderByDescending(GetSortExpression(parameters.SortBy));
                else
                    query = query.OrderBy(GetSortExpression(parameters.SortBy));
            }

            var items = await query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();

            return new PagedResult<T>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize
            };
        }

        public virtual async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            return entity;
        }

        public virtual async Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
            return entities;
        }

        public virtual Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            return Task.CompletedTask;
        }

        public virtual Task UpdateRangeAsync(IEnumerable<T> entities)
        {
            _dbSet.UpdateRange(entities);
            return Task.CompletedTask;
        }

        public virtual Task DeleteAsync(T entity)
        {
            _dbSet.Remove(entity);
            return Task.CompletedTask;
        }

        public virtual Task DeleteRangeAsync(IEnumerable<T> entities)
        {
            _dbSet.RemoveRange(entities);
            return Task.CompletedTask;
        }

        public virtual async Task<int> CountAsync()
        {
            return await _dbSet.CountAsync();
        }

        public virtual async Task<int> CountAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.CountAsync(predicate);
        }

        public virtual async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.AnyAsync(predicate);
        }

        protected virtual Expression<Func<T, object>> GetSortExpression(string sortBy)
        {
            // Default sort by Id if available
            var parameter = Expression.Parameter(typeof(T), "x");
            var property = typeof(T).GetProperty("Id");
            
            if (property != null)
            {
                var propertyAccess = Expression.MakeMemberAccess(parameter, property);
                var convertedProperty = Expression.Convert(propertyAccess, typeof(object));
                return Expression.Lambda<Func<T, object>>(convertedProperty, parameter);
            }

            // Fallback to first property
            var firstProperty = typeof(T).GetProperties().FirstOrDefault();
            if (firstProperty != null)
            {
                var propertyAccess = Expression.MakeMemberAccess(parameter, firstProperty);
                var convertedProperty = Expression.Convert(propertyAccess, typeof(object));
                return Expression.Lambda<Func<T, object>>(convertedProperty, parameter);
            }

            throw new InvalidOperationException($"Cannot create sort expression for type {typeof(T)}");
        }
    }
}