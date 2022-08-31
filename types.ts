export interface Id {
  id: number;
}

export interface Book extends Id {
  title: string;
  author_name: string;
  author_surname: string;
  isbn: string;
  quantity: number;
}

export interface BookWithBorrow extends Book {
  borrowed: number;
}

interface ReaderCommon extends Id {
  name: string;
  surname: string;
}

export interface Reader extends ReaderCommon {
  phonenumber: number;
  city: string;
  street: string;
  house: string;
  zipcode: string;
}

export interface ReaderWithBorrow extends ReaderCommon {
  borrowsid: number[];
}

export interface Borrow extends Id {
  bookid: number;
  readerid: number;
  date_from: number;
  date_to: number;
}

export interface LoginData {
  login: string;
  password: string;
}

export interface UserProfile extends LoginData{
  refresh_token: string;
}

export type NextFn = () => Promise<unknown>;
