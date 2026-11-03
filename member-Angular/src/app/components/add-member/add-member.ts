import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Member } from '../../models/member';
import { Category } from '../../models/category';
import { BorrowedItem } from '../../models/borrowed-item';
import { MemberService } from '../../services/member-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UploadResponse } from '../../models/upload-response';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-add-member',
  styleUrl: './add-member.css',
  templateUrl: './add-member.html',
})
  export class AddMember implements OnInit {
 
    isEditMode: boolean = false;
    memberIdToEdit: number | null = null;
    memberObj: Member = {
    memberId: 0,
    memberName: '',
    membershipDate: '',
    membershipFee: 0,
    isStudent: false,
    categoryId: 0,
    imageUrl: '',
    borrowedItems: [],
  };
  categories: Category[] = [];
  itemList: BorrowedItem[] = [];
  imageUrl: any = null;
  selectedFile: File | null = null;
  apiBaseUrl: string = 'http://localhost:5053';

  constructor(
    private service: MemberService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.memberIdToEdit = +idParam;
        this.loadMemberForEditing(this.memberIdToEdit);
      }
    });
  }
  loadCategories() {
    this.service.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load categories', err),
    });
  }
  loadMemberForEditing(memberIdToEdit: number) {
    this.service.getById(memberIdToEdit).subscribe({
      next: (foundMember: Member) => {
        if (foundMember) {
          this.memberObj = { ...foundMember };
          // input type=date needs yyyy-MM-dd
          // this.memberObj.membershipDate = String(foundMember.membershipDate).substring(0, 10);
          this.itemList = foundMember.borrowedItems ? [...foundMember.borrowedItems] : [];
          if (foundMember.imageUrl) {
            this.imageUrl = `${this.apiBaseUrl}/images/${foundMember.imageUrl}`;
          }
          this.cdr.detectChanges();
        }
         else {
          console.error('Member not found ID:' + memberIdToEdit);
          this.router.navigate(['/display-member']);
        }
      },
      error: (err) => {
        console.error('Failed to load member details', err);
      },
    });
  }
  
  addItem(): void {
    this.itemList.push({ borrowedItemId: 0, bookName: '', authorName: '', memberId: 0 });
  }
  deleteItem(item: BorrowedItem): void {
    const index = this.itemList.indexOf(item);
    if (index > -1) {
      this.itemList.splice(index, 1);
    }
  }
  onSelectedFile(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }
  saveMember(): void {
    const targetMember: Member = {
      memberId: this.memberObj.memberId,
      memberName: this.memberObj.memberName,
      membershipDate: this.memberObj.membershipDate,
      membershipFee: this.memberObj.membershipFee,
      isStudent: this.memberObj.isStudent,
      categoryId: this.memberObj.categoryId,
      imageUrl: this.memberObj.imageUrl || undefined,
      borrowedItems: this.itemList,
    };
    if (this.isEditMode) {
      this.service.update(targetMember).subscribe({
        next: (updateResult) => {
          console.log('member updated successfully', updateResult);
          this.HandleImage(this.memberIdToEdit!);
        },
        error: (err) => console.error('Error occured to update member', err),
      });
    } else {
      this.service.save(targetMember).subscribe({
        next: (saveMember) => {
          console.log('Member saved Successfully', saveMember);
          this.HandleImage(saveMember.memberId);
        },
        error: (err) => console.error('Error occured to Save member', err),
      });
    }
  }
  private HandleImage(id: number): void {
    if (this.selectedFile) {
      this.UploadImage(id);
    } else {
      this.finishandNavigate();
    }
  }
  UploadImage(id: number) {
    if (this.selectedFile) {
      this.service.uploadImage(id, this.selectedFile).subscribe({
        next: (uploadResponse: UploadResponse) => {
          console.log(`Image Uploaded`, uploadResponse);
          this.finishandNavigate();
        },
        error: (err) => {
          console.log('Failed to upload Image', err);
          this.finishandNavigate();
        },
      });
    }
  }
  private finishandNavigate() {
    this.router.navigate(['/display-member']);
  }
}
