import { createZodDto } from 'nestjs-zod';
import {
    analyticsQuerySchema,
    overviewMetricsResponseSchema,
    salesPerformanceResponseSchema,
    trafficMetricsResponseSchema,
} from '@my-app/types';

export class AnalyticsQueryDto extends createZodDto(analyticsQuerySchema) {}

export class OverviewMetricsResponseDto extends createZodDto(overviewMetricsResponseSchema) {}

export class SalesPerformanceResponseDto extends createZodDto(salesPerformanceResponseSchema) {}

export class TrafficMetricsResponseDto extends createZodDto(trafficMetricsResponseSchema) {}
