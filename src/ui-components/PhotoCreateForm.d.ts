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
export declare type PhotoCreateFormInputValues = {
    s3key?: string;
    type?: string;
    aspectRatio?: string;
    blurredUrl?: string;
};
export declare type PhotoCreateFormValidationValues = {
    s3key?: ValidationFunction<string>;
    type?: ValidationFunction<string>;
    aspectRatio?: ValidationFunction<string>;
    blurredUrl?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type PhotoCreateFormOverridesProps = {
    PhotoCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    s3key?: PrimitiveOverrideProps<TextFieldProps>;
    type?: PrimitiveOverrideProps<TextFieldProps>;
    aspectRatio?: PrimitiveOverrideProps<TextFieldProps>;
    blurredUrl?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type PhotoCreateFormProps = React.PropsWithChildren<{
    overrides?: PhotoCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: PhotoCreateFormInputValues) => PhotoCreateFormInputValues;
    onSuccess?: (fields: PhotoCreateFormInputValues) => void;
    onError?: (fields: PhotoCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: PhotoCreateFormInputValues) => PhotoCreateFormInputValues;
    onValidate?: PhotoCreateFormValidationValues;
} & React.CSSProperties>;
export default function PhotoCreateForm(props: PhotoCreateFormProps): React.ReactElement;
