import { Injectable } from '@nestjs/common';
import LeoProfanity from 'leo-profanity';

// Базовий англомовний словник постачається разом із leo-profanity.
// Для українськомовного контенту додайте власні слова нижче — вони
// підвантажуються один раз при старті сервісу через LeoProfanity.add().
const PROFANITY_CUSTOM_WORDS: string[] = [
    // TODO: додайте українські заборонені слова (рядок за рядком)
];

@Injectable()
export class ProfanityService {
    constructor() {
        // Скидаємо до стандартного набору, щоб уникнути дублювання при HMR
        LeoProfanity.reset();
        // Підключаємо користувацький словник (українська лексика тощо)
        if (PROFANITY_CUSTOM_WORDS.length > 0) {
            LeoProfanity.add(PROFANITY_CUSTOM_WORDS);
        }
    }

    /**
     * Перевіряє рядок на наявність нецензурної лексики.
     * @returns true — знайдено заборонене слово, false — чистий текст
     */
    containsProfanity(text: string): boolean {
        if (!text) {
            return false;
        }
        return LeoProfanity.check(text);
    }
}
