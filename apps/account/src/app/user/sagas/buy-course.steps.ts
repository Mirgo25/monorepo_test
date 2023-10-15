import { CourseGetCourse, PaymentCheck, PaymentGenerateLink, PaymentStatus } from "@test-monorepo/contracts";
import { UserEntity } from "../entities/user.entity";
import { BuyCourseSagaState } from "./buy-course.state";
import { PurchaseState } from "@test-monorepo/interfaces";

export class BuyCourseSagaStateStarted extends BuyCourseSagaState {
  public async pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
    const { course } = await this.saga.rmqService.send<CourseGetCourse.Request, CourseGetCourse.Response>(CourseGetCourse.topic, {
      id: this.saga.courseId,
    });
    if (!course) {
      throw new Error('The course does not exists.');
    }

    if (course.price == 0) {
      this.saga.setState(PurchaseState.Purchased, course._id);
      return { paymentLink: null, user: this.saga.user };
    }

    const { paymentLink } = await this.saga.rmqService.send<PaymentGenerateLink.Request, PaymentGenerateLink.Response>(PaymentGenerateLink.topic, {
      courseId: course._id,
      userId: this.saga.user._id,
      sum: course.price,
    });

    this.saga.setState(PurchaseState.WaitingForPayment, course._id);
    return { paymentLink, user: this.saga.user };
  }

  public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('it is not possible to check a payment that has not started.');
  }

  public async cancel(): Promise<{ user: UserEntity; }> {
    this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
    return { user: this.saga.user };
  }
}

export class BuyCourseSagaStateProcess extends BuyCourseSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
    throw new Error('It is not possible to pay. The payment is in progress.');
  }

  public async checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    const { status } = await this.saga.rmqService.send<PaymentCheck.Request, PaymentCheck.Response>(PaymentCheck.topic, {
      courseId: this.saga.courseId,
      userId: this.saga.user._id,
    });

    switch (status) {
      case 'success':
        this.saga.setState(PurchaseState.Purchased, this.saga.courseId);
        return { user: this.saga.user, status: 'success' };
      case 'canceled':
        this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
        return { user: this.saga.user, status: 'canceled' };
      case 'progress':
        return { user: this.saga.user, status: 'progress' };
    }
  }

  public cancel(): Promise<{ user: UserEntity; }> {
    throw new Error('It is not possible to cancel. The payment is in progress.');
  }
}

export class BuyCourseSagaStatePurchased extends BuyCourseSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
    throw new Error('It is not possible to pay. The course is already bought.');
  }

  public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('It is not possible to check the payment. The course is already bought.');
  }

  public cancel(): Promise<{ user: UserEntity; }> {
    throw new Error('It is not possible to cancel. The course is already bought.');
  }
}


export class BuyCourseSagaStateCanceled extends BuyCourseSagaState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
    this.saga.setState(PurchaseState.Started, this.saga.courseId);
    return this.saga.getState().pay();
  }

  public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('It is not possible to check the payment. The course is already canceled.');
  }

  public cancel(): Promise<{ user: UserEntity; }> {
    throw new Error('It is not possible to cancel. The course is already canceled.');
  }
}
