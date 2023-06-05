/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { Photo } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type PhotoUpdateFormInputValues = {
    s3key?: string;
    type?: string;
};
export declare type PhotoUpdateFormValidationValues = {
    s3key?: ValidationFunction<string>;
    type?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type PhotoUpdateFormOverridesProps = {
    PhotoUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    s3key?: PrimitiveOverrideProps<TextFieldProps>;
    type?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type PhotoUpdateFormProps = React.PropsWithChildren<{
    overrides?: PhotoUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    photo?: Photo;
    onSubmit?: (fields: PhotoUpdateFormInputValues) => PhotoUpdateFormInputValues;
    onSuccess?: (fields: PhotoUpdateFormInputValues) => void;
    onError?: (fields: PhotoUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: PhotoUpdateFormInputValues) => PhotoUpdateFormInputValues;
    onValidate?: PhotoUpdateFormValidationValues;
} & React.CSSProperties>;
export default function PhotoUpdateForm(props: PhotoUpdateFormProps): React.ReactElement;
