import { AccountChangedCourse } from '@test-monorepo/contracts';
import { IDomainEvent, IUser, IUserCourse, PurchaseState, UserRole } from '@test-monorepo/interfaces';
import { genSalt, hash, compare } from 'bcryptjs';

export class UserEntity implements IUser {
  _id?: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses?: IUserCourse[];
  events: IDomainEvent[] = [];

  constructor(user: Omit<IUser, 'passwordHash'>);
  constructor(user: IUser) {
    this._id = user._id;
    this.displayName = user.displayName;
    this.email = user.email;
    this.role = user.role;
    if (user.passwordHash) {
      this.passwordHash = user.passwordHash;
    }
    this.courses = user.courses;
  }

  public setCourseState(courseId: string, state: PurchaseState) {
    const exist = this.courses.find((c) => c.courseId === courseId);
    if (!exist) {
      this.courses.push({
        courseId,
        purchaseState: state,
      });
      return this;
    }

    if (state === PurchaseState.Canceled) {
      this.courses = this.courses.filter((c) => c.courseId !== courseId);
      return this;
    }

    this.courses = this.courses.map((c) => {
      if (c.courseId === courseId) {
        c.purchaseState = state;
      }
      return c;
    });
    this.events.push({
      topic: AccountChangedCourse.topic,
      data: {
        courseId,
        userId: this._id,
        state,
      },
    });
    return this;
  }

  public getCourseState(courseId: string): PurchaseState {
    return this.courses.find((c) => c.courseId === courseId)?.purchaseState ?? PurchaseState.Started;
  }

  public getPublicProfile() {
    return {
      displayName: this.displayName,
      email: this.email,
      role: this.role,
    };
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public async validatePassword(password: string) {
    return compare(password, this.passwordHash);
  }

  public updateProfile(displayName: string) {
    this.displayName = displayName;
    return this;
  }
}
