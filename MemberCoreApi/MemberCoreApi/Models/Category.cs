using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.Numerics;

namespace MemberCoreApi.Models
{
    public class Category
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public virtual ICollection<Member> Members { get; set; } = new List<Member>();
    }

    public class Member
    {
        public int MemberId { get; set; }
        public string MemberName { get; set; } = null!;
        public DateTime MembershipDate { get; set; }
        [Column(TypeName = "money")]
        public decimal MembershipFee { get; set; }
        public bool IsStudent { get; set; }
        public int CategoryId { get; set; }
        public string? ImageUrl { get; set; }

        public virtual Category? Category { get; set; }
        public virtual ICollection<BorrowedItem> BorrowedItems { get; set; } = new List<BorrowedItem>();
    }

    public class BorrowedItem
    {
        public int BorrowedItemId { get; set; }
        public string BookName { get; set; } = null!;
        public string AuthorName { get; set; } = null!;
        public int MemberId { get; set; }

        public virtual Member? Member { get; set; }
    }
    public class AppDbContext:DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext>op):base(op)
        {
            
        }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<BorrowedItem> BorrowedItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
                modelBuilder.Entity<BorrowedItem>()
                   .HasOne(b => b.Member)
                   .WithMany(m => m.BorrowedItems)
                   .HasForeignKey(b => b.MemberId)
                   .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Category>().HasData(
                new Category { CategoryId = 1, CategoryName = "Premium" },
                new Category { CategoryId = 2, CategoryName = "Regular" },
                new Category { CategoryId = 3, CategoryName = "Guest" });

            modelBuilder.Entity<Member>().HasData(
                new Member { MemberId = 1, MemberName = "Fahad", MembershipDate = new DateTime(2026, 1, 1), MembershipFee = 1500, IsStudent = true, CategoryId = 1, ImageUrl = "" });

            modelBuilder.Entity<BorrowedItem>().HasData(
                new BorrowedItem { BorrowedItemId = 1, BookName = "Ognibina", AuthorName = "Kazi Nazrul Islam", MemberId = 1 },
               new BorrowedItem { BorrowedItemId = 2, BookName = "Kobor", AuthorName = "Jashimuddin", MemberId = 1 });
        }
    }
    public class UploadResponse
    {
        public string FileName { get; set; } = default!;
    }
}
