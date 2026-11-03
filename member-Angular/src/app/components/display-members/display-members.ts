
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Member } from '../../models/member';
import { MemberService } from '../../services/member-service';
const apiUrl="http://localhost:5053";

@Component({
  imports: [RouterLink, CommonModule],
  selector: 'app-display-members',
  styleUrl: './display-members.css',
  templateUrl: './display-members.html',
})
export class DisplayMembers implements OnInit {
  member:Member[]=[];
  constructor(
    private mservice:MemberService,
    private router:Router,
    private cdr:ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.getAllMembers();
    this.cdr.detectChanges();
  }

  getAllMembers():void{
    this.mservice.get().subscribe({
      next:(data)=>{
        this.member=data;
        this.cdr.detectChanges();
      },
      error:(err)=>{
        console.error('Error: '+err)
      }
    });
  }

  deleteMember(id:number){
    if(confirm('Are You sure to delete this record?')){
      this.mservice.delete(id).subscribe({
        next:()=>{
          this.cdr.detectChanges();
          this.getAllMembers();
        },
        error:(err)=>{
          console.error('Error: '+err)
        }
      });
    }
  }

  getImageUrl(fileName:string):string{
    return `${apiUrl}/images/${fileName}`
  }

}
