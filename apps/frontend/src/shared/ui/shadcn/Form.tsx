'use client';

import * as React from 'react';
import {
    Controller,
    FormProvider,
    useFormContext,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
} from 'react-hook-form';
import { cn } from '@/shared/lib/utils';
import { Label } from './Label';

const Form = FormProvider;

type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    ...props
}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
};

type FormItemContextValue = {
    id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

function useFormField() {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState, formState } = useFormContext();

    const fieldState = getFieldState(fieldContext.name, formState);

    if (!fieldContext) {
        throw new Error('useFormField should be used within <FormField>');
    }

    const { id } = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
}

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        const id = React.useId();
        return (
            <FormItemContext.Provider value={{ id }}>
                <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />
            </FormItemContext.Provider>
        );
    },
);
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => {
    const { error, formItemId } = useFormField();

    return (
        <Label
            ref={ref}
            className={cn(error && 'text-red-600 dark:text-red-400', className)}
            htmlFor={formItemId}
            {...props}>
            {children}
            {required && <span className="ml-0.5 text-red-500">*</span>}
        </Label>
    );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
    HTMLElement,
    React.HTMLAttributes<HTMLElement> & { children?: React.ReactElement }
>(({ children, ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    if (!children) return null;

    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        ref,
        id: formItemId,
        'aria-describedby': error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId,
        'aria-invalid': !!error,
    });
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => {
        const { formDescriptionId } = useFormField();
        return (
            <p
                ref={ref}
                id={formDescriptionId}
                className={cn('text-sm text-[#6B6A65] dark:text-[#94938D]', className)}
                {...props}
            />
        );
    },
);
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, children, ...props }, ref) => {
        const { error, formMessageId } = useFormField();
        const body = error ? String(error?.message ?? '') : children;

        if (!body) return null;

        return (
            <p
                ref={ref}
                id={formMessageId}
                className={cn('text-sm font-medium text-red-600 dark:text-red-400', className)}
                {...props}>
                {body}
            </p>
        );
    },
);
FormMessage.displayName = 'FormMessage';

export {
    useFormField,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
};
