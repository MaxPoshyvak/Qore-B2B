import { SetMetadata } from '@nestjs/common';

export type RequiredPlan = 'pro' | 'business';

export const REQUIRED_PLAN_KEY = 'required_plan';

export const RequirePlan = (plan: RequiredPlan) => SetMetadata(REQUIRED_PLAN_KEY, plan);
