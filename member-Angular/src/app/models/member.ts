import { BorrowedItem } from './borrowed-item';
import { Category } from './category';

export interface Member {
  memberId: number;
  memberName: string;
  membershipDate?: Date | string;
  membershipFee?: number;
  isStudent?: boolean;
  categoryId: number;
  imageUrl?: string;
  category?: Category;
  borrowedItems?: BorrowedItem[];
}
