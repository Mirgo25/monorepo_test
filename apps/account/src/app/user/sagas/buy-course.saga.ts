import { RMQService } from "nestjs-rmq";
import { UserEntity } from "../entities/user.entity";
import { PurchaseState } from "@test-monorepo/interfaces";
import { BuyCourseSagaState } from "./buy-course.state";

export class BuyCourseSaga {
  private state: BuyCourseSagaState;

  constructor(
    private user: UserEntity,
    private courseId: string,
    private rmqService: RMQService,
  ) { }

  public getState() {
    return this.state;
  }

  public setState(state: PurchaseState, courseId: string) {
    switch (state) {
      case PurchaseState.Started:
        break;
      case PurchaseState.WaitingForPayment:
        break;
      case PurchaseState.Purchased:
        break;
      case PurchaseState.Canceled:
        break;
    }
    this.state.setContext(this);
    this.user.updateCourseState(courseId, state);
  }
}
