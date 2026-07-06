using CareerPathAI.Application.Interfaces;
using CareerPathAI.Domain.Entities;
using CareerPathAI.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace CareerPathAI.Persistence.Repositories;

public class EfUserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public EfUserRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<bool> EmailExistsAsync(string email) =>
        _db.Users.AnyAsync(u => u.Email == email);

    public Task<User?> GetByEmailAsync(string email) =>
        _db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public Task<User?> GetByIdAsync(int id) =>
        _db.Users.FirstOrDefaultAsync(u => u.Id == id);

    public async Task AddAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }
}
