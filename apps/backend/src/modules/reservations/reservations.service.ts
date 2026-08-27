import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Reservation, ReservationStatus, TenantSettings } from '@my-app/database';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
    AvailabilitySlot,
    CreateReservationDto,
    ReservationResponse,
    ReservationStatusType,
    UpdateReservationDto,
} from '@my-app/types';

const DEFAULT_VENUE_CAPACITY = 20;
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

type DayConfig = { isOpen: boolean; openTime?: string; closeTime?: string };

@Injectable()
export class ReservationsService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Returns the bookable time slots for a venue on a given date. Each slot carries
     * its remaining guest capacity (total venue capacity minus already-booked guests
     * whose reservation lands inside that slot window).
     */
    async getAvailability(slug: string, date: string): Promise<AvailabilitySlot[]> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            include: { settings: true, tables: true },
        });

        if (!tenant) {
            throw new NotFoundException('Venue not found');
        }

        const requestedDate = this.parseDate(date);
        if (!requestedDate) {
            throw new BadRequestException('Invalid date format. Expected YYYY-MM-DD');
        }

        const dayConfig = this.getDayConfig(tenant.settings, requestedDate);
        if (!dayConfig?.isOpen || !dayConfig.openTime || !dayConfig.closeTime) {
            return [];
        }

        const capacity =
            (tenant.tables ?? []).reduce((sum, t) => sum + (t.capacity ?? 0), 0) || DEFAULT_VENUE_CAPACITY;
        const step = tenant.settings?.reservationStepMinutes ?? 30;

        const [openH, openM] = dayConfig.openTime.split(':').map(Number);
        const [closeH, closeM] = dayConfig.closeTime.split(':').map(Number);

        const open = new Date(requestedDate);
        open.setHours(openH, openM, 0, 0);
        const close = new Date(requestedDate);
        close.setHours(closeH, closeM, 0, 0);

        const slots: Date[] = [];
        const cursor = new Date(open);
        while (cursor < close) {
            slots.push(new Date(cursor));
            cursor.setMinutes(cursor.getMinutes() + step);
        }

        const dayStart = new Date(requestedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(requestedDate);
        dayEnd.setHours(23, 59, 59, 999);

        const existing = await this.prisma.reservation.findMany({
            where: {
                tenantId: tenant.id,
                reservedAt: { gte: dayStart, lte: dayEnd },
                status: { notIn: [ReservationStatus.cancelled, ReservationStatus.completed] },
            },
            select: { reservedAt: true, guestsCount: true },
        });

        return slots.map((slotStart) => {
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + step);

            const booked = existing.reduce((sum, r) => {
                const t = r.reservedAt.getTime();
                return t >= slotStart.getTime() && t < slotEnd.getTime() ? sum + r.guestsCount : sum;
            }, 0);

            const remaining = Math.max(0, capacity - booked);

            return {
                time: this.formatTime(slotStart),
                available: remaining > 0,
                remaining,
            };
        });
    }

    async createReservation(slug: string, dto: CreateReservationDto): Promise<ReservationResponse> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            include: { settings: true },
        });

        if (!tenant) {
            throw new NotFoundException('Venue not found');
        }

        const created = await this.prisma.reservation.create({
            data: {
                tenantId: tenant.id,
                tableId: null,
                guestName: dto.guestName,
                guestPhone: dto.guestPhone,
                guestsCount: dto.guestsCount,
                reservedAt: new Date(dto.reservedAt),
                notes: dto.notes ?? null,
                status: ReservationStatus.pending,
            },
        });

        return this.serialize(created);
    }

    async getReservations(tenantId: string): Promise<ReservationResponse[]> {
        const reservations = await this.prisma.reservation.findMany({
            where: { tenantId },
            orderBy: { reservedAt: 'asc' },
        });

        return reservations.map((r) => this.serialize(r));
    }

    async updateReservation(
        tenantId: string,
        id: string,
        dto: UpdateReservationDto,
    ): Promise<ReservationResponse> {
        const existing = await this.prisma.reservation.findUnique({ where: { id } });

        if (!existing) {
            throw new NotFoundException('Reservation not found');
        }

        if (existing.tenantId !== tenantId) {
            throw new BadRequestException('Reservation does not belong to this venue');
        }

        const data: Prisma.ReservationUpdateInput = {};
        if (dto.status) {
            data.status = dto.status as ReservationStatus;
        }
        if (dto.tableId !== undefined) {
            data.tableId = dto.tableId;
        }

        const updated = await this.prisma.reservation.update({ where: { id }, data });

        return this.serialize(updated);
    }

    async cancelReservation(id: string): Promise<ReservationResponse> {
        const existing = await this.prisma.reservation.findUnique({ where: { id } });

        if (!existing) {
            throw new NotFoundException('Reservation not found');
        }

        const updated = await this.prisma.reservation.update({
            where: { id },
            data: { status: ReservationStatus.cancelled },
        });

        return this.serialize(updated);
    }

    /**
     * Public lookup used by the guest menu page when a table QR is scanned. Returns the
     * soonest reservation assigned to that specific table within the next 45 minutes
     * (so the menu can warn a guest the table is about to be claimed), or null.
     */
    async getTableUpcomingReservation(slug: string, tableId: string): Promise<ReservationResponse | null> {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug } });

        if (!tenant) {
            throw new NotFoundException('Venue not found');
        }

        const now = new Date();
        const horizon = new Date(now.getTime() + 45 * 60 * 1000);

        const reservation = await this.prisma.reservation.findFirst({
            where: {
                tenantId: tenant.id,
                tableId,
                status: { notIn: [ReservationStatus.cancelled, ReservationStatus.completed] },
                reservedAt: { gte: now, lte: horizon },
            },
            orderBy: { reservedAt: 'asc' },
        });

        return reservation ? this.serialize(reservation) : null;
    }

    private parseDate(value: string): Date | null {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
        const parsed = new Date(`${value}T00:00:00`);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    private getDayConfig(settings: TenantSettings | null, date: Date): DayConfig | null {
        const workingHours = (settings?.workingHours ?? null) as
            | Record<string, { isOpen?: boolean; openTime?: string; closeTime?: string } | null>
            | null;

        if (!workingHours) return null;

        const day = workingHours[DAY_KEYS[date.getDay()]];
        if (!day) return null;

        return {
            isOpen: day.isOpen ?? false,
            openTime: day.openTime,
            closeTime: day.closeTime,
        };
    }

    private formatTime(date: Date): string {
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }

    private serialize(r: Reservation): ReservationResponse {
        return {
            id: r.id,
            tenantId: r.tenantId,
            tableId: r.tableId,
            guestName: r.guestName,
            guestPhone: r.guestPhone,
            guestsCount: r.guestsCount,
            reservedAt: r.reservedAt.toISOString(),
            status: r.status as ReservationStatusType,
            notes: r.notes,
            createdAt: r.createdAt.toISOString(),
        };
    }
}
