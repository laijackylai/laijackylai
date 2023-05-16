/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { TakcarlyCoverPhoto } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type TakcarlyCoverPhotoUpdateFormInputValues = {
    name?: string;
    url?: string;
};
export declare type TakcarlyCoverPhotoUpdateFormValidationValues = {
    name?: ValidationFunction<string>;
    url?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TakcarlyCoverPhotoUpdateFormOverridesProps = {
    TakcarlyCoverPhotoUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    url?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type TakcarlyCoverPhotoUpdateFormProps = React.PropsWithChildren<{
    overrides?: TakcarlyCoverPhotoUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    takcarlyCoverPhoto?: TakcarlyCoverPhoto;
    onSubmit?: (fields: TakcarlyCoverPhotoUpdateFormInputValues) => TakcarlyCoverPhotoUpdateFormInputValues;
    onSuccess?: (fields: TakcarlyCoverPhotoUpdateFormInputValues) => void;
    onError?: (fields: TakcarlyCoverPhotoUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TakcarlyCoverPhotoUpdateFormInputValues) => TakcarlyCoverPhotoUpdateFormInputValues;
    onValidate?: TakcarlyCoverPhotoUpdateFormValidationValues;
} & React.CSSProperties>;
export default function TakcarlyCoverPhotoUpdateForm(props: TakcarlyCoverPhotoUpdateFormProps): React.ReactElement;
