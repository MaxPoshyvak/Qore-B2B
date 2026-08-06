import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Робить модуль доступним скрізь без додаткових імпортів
@Module({
    providers: [PrismaService],
    exports: [PrismaService], // Обов'язково експортуємо
})
export class PrismaModule {}
