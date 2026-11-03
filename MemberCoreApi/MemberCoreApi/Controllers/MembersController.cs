using MemberCoreApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Numerics;

namespace MemberCoreApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MembersController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public MembersController(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Member>>> GetAllMember()
        {
            var mem = await _db.Members.Include(c => c.Category).Include(b => b.BorrowedItems).ToListAsync();
            return Ok(mem);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Member>> GetMemberById(int id)
        {
            var mem = await _db.Members.Include(c => c.Category).Include(b => b.BorrowedItems).FirstOrDefaultAsync(p => p.MemberId == id);
            return Ok(mem);
        }
        [HttpGet("Categories")]
        public async Task<ActionResult<IEnumerable<Member>>> GetAllCategories()
        {
            var category = await _db.Categories.ToListAsync();
            return Ok(category);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            var mem = await _db.Members.FindAsync(id);
            if (mem == null) return NotFound();
            _db.Members.Remove(mem);
            await _db.SaveChangesAsync();
            return NoContent();
        }
        [HttpPost]
        public async Task<ActionResult<Member>> SaveMember(Member mem)
        {
            if (string.IsNullOrEmpty(mem.ImageUrl))
            {
                mem.ImageUrl = "noimage.jpg";
            }
            mem.BorrowedItems ??= new List<BorrowedItem>();
            _db.Members.Add(mem);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMemberById), new { id = mem.MemberId }, mem);
        }


        [HttpPost("Upload/{id}")]
        public async Task<ActionResult<UploadResponse>> Upload(int id, IFormFile file)
        {
            var mem = await _db.Members.FindAsync(id);
            if (mem == null) return NotFound();
           
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
           
            if (file.ContentType != "image/jpeg" && file.ContentType != "image/png")
            {
                return BadRequest("Only Jpg  And png files are allowed");
            }
            if (file.Length > 2 * 1024 * 1024) return BadRequest("File Size must be 2 mb");
            
            string ext = Path.GetExtension(file.FileName);
            //string fileName = Path.GetFileNameWithoutExtension(Path.GetRandomFileName()) + ext;
            string fileName = Guid.NewGuid().ToString() + ext;
            string savePath = Path.Combine(_env.WebRootPath, "images", fileName);
            if (!Directory.Exists(Path.Combine(_env.WebRootPath, "images")))
            {
                Directory.CreateDirectory(Path.Combine(_env.WebRootPath, "images"));
            }
            try
            {
                using (var filestream = new FileStream(savePath, FileMode.Create))
                {
                    await file.CopyToAsync(filestream);
                }
                mem.ImageUrl = fileName;
                await _db.SaveChangesAsync();
                return Ok(new UploadResponse { FileName = mem.ImageUrl });
            }
            catch (IOException ex)
            {
                Console.WriteLine($"An error occurred while uploading the file: {ex.Message}");
                return StatusCode(500, "An error occurred while uploading the file.");
            }
        }

       
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(int id, Member mem)
        {
            if (id != mem.MemberId)
                return BadRequest();

            var exMember = await _db.Members
                .Include(m => m.BorrowedItems)
                .FirstOrDefaultAsync(m => m.MemberId == id);

            if (exMember == null)
                return NotFound();

          
            _db.Entry(exMember).CurrentValues.SetValues(mem);

            if (mem.BorrowedItems != null)
            {
              
                var itemsToRemove = exMember.BorrowedItems
                    .Where(existing =>
                        !mem.BorrowedItems.Any(ib =>
                            ib.BorrowedItemId == existing.BorrowedItemId))
                    .ToList();

                _db.BorrowedItems.RemoveRange(itemsToRemove);

              
                foreach (var item in mem.BorrowedItems)
                {
                    var existingItem = exMember.BorrowedItems
                        .FirstOrDefault(x =>
                            x.BorrowedItemId == item.BorrowedItemId);

                    if (existingItem != null)
                    {
                        _db.Entry(existingItem).CurrentValues.SetValues(item);
                    }
                    else
                    {
                        exMember.BorrowedItems.Add(item);
                    }
                }
            }

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MemberExists(id))
                    return NotFound();

                throw;
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
            }

            return NoContent();
        }
        private bool MemberExists(int id)
        {
            return _db.Members.Any(p => p.MemberId == id);
        }
    }
}
