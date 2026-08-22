'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/shadcn/Input';
import { PrimaryButton } from '@/shared/ui/PrimaryButton';
import { useCartStore } from '../store/useCartStore';
import { useTableSessionStore } from '@/shared/store/useTableSessionStore';

export function GuestNameModal() {
    const isOpen = useCartStore((s) => s.isNameModalOpen);
    const setGuestName = useCartStore((s) => s.setGuestName);
    const setNameModalOpen = useCartStore((s) => s.setNameModalOpen);
    const tableName = useTableSessionStore((s) => s.tableName);

    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setError(null);
        }
    }, [isOpen]);

    function handleSubmit() {
        if (name.trim().length < 2) {
            setError('Please enter at least 2 characters');
            return;
        }
        setGuestName(name);
    }

    return (
        <Modal
            open={isOpen}
            onClose={() => setNameModalOpen(false)}
            title={tableName ? `Welcome to Table ${tableName}!` : 'Welcome!'}
            description="Enter your name so everyone at the table knows who added this item.">
            <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[#6B6A65] dark:text-[#94938D]">
                    Your name
                </span>
                <Input
                    type="text"
                    autoFocus
                    placeholder="e.g. Alex"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError(null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSubmit();
                    }}
                    className={error ? 'border-red-400/70' : ''}
                />
            </label>

            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

            <div className="mt-5 flex justify-end">
                <PrimaryButton type="button" onClick={handleSubmit}>
                    Continue to Menu
                </PrimaryButton>
            </div>
        </Modal>
    );
}
