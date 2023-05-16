/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type TakcarlyCoverPhotoCreateFormInputValues = {
    name?: string;
    url?: string;
};
export declare type TakcarlyCoverPhotoCreateFormValidationValues = {
    name?: ValidationFunction<string>;
    url?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TakcarlyCoverPhotoCreateFormOverridesProps = {
    TakcarlyCoverPhotoCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    url?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type TakcarlyCoverPhotoCreateFormProps = React.PropsWithChildren<{
    overrides?: TakcarlyCoverPhotoCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: TakcarlyCoverPhotoCreateFormInputValues) => TakcarlyCoverPhotoCreateFormInputValues;
    onSuccess?: (fields: TakcarlyCoverPhotoCreateFormInputValues) => void;
    onError?: (fields: TakcarlyCoverPhotoCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TakcarlyCoverPhotoCreateFormInputValues) => TakcarlyCoverPhotoCreateFormInputValues;
    onValidate?: TakcarlyCoverPhotoCreateFormValidationValues;
} & React.CSSProperties>;
export default function TakcarlyCoverPhotoCreateForm(props: TakcarlyCoverPhotoCreateFormProps): React.ReactElement;
