import {IUser} from '../entities/IUser'


export interface IUserRepository{
    findByEmail(email:string):Promise<IUser | null>;
}




