import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Member } from '../models/member';
import { Category } from '../models/category';
import { UploadResponse } from '../models/upload-response';
const apiBaseUrl = 'http://localhost:5053';
@Service()
export class MemberService {
  constructor() {}
  private http = inject(HttpClient);

  get(): Observable<Member[]> {
    return this.http.get<Member[]>(`${apiBaseUrl}/api/Members`);
  }
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${apiBaseUrl}/api/Members/Categories`);
  }
  getById(id: number): Observable<Member> {
    return this.http.get<Member>(`${apiBaseUrl}/api/Members/${id}`);
  }
  save(data: Member): Observable<Member> {
    return this.http.post<Member>(`${apiBaseUrl}/api/Members`, data);
  }
  uploadImage(id: number, pic: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('File', pic);
    return this.http.post<UploadResponse>(`${apiBaseUrl}/api/Members/Upload/${id}`, formData);
  }
  update(data: Member): Observable<any> {
    return this.http.put<Member>(`${apiBaseUrl}/api/Members/${data.memberId}`, data);
  }
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${apiBaseUrl}/api/Members/${id}`);
  }
}
