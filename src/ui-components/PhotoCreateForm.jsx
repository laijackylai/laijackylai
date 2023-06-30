/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { getOverrideProps } from "@aws-amplify/ui-react/internal";
import { Photo } from "../models";
import { fetchByPath, validateField } from "./utils";
import { DataStore } from "aws-amplify";
export default function PhotoCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    s3key: "",
    type: "",
    aspectRatio: "",
    blurredUrl: "",
  };
  const [s3key, setS3key] = React.useState(initialValues.s3key);
  const [type, setType] = React.useState(initialValues.type);
  const [aspectRatio, setAspectRatio] = React.useState(
    initialValues.aspectRatio
  );
  const [blurredUrl, setBlurredUrl] = React.useState(initialValues.blurredUrl);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setS3key(initialValues.s3key);
    setType(initialValues.type);
    setAspectRatio(initialValues.aspectRatio);
    setBlurredUrl(initialValues.blurredUrl);
    setErrors({});
  };
  const validations = {
    s3key: [{ type: "Required" }],
    type: [{ type: "Required" }],
    aspectRatio: [],
    blurredUrl: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          s3key,
          type,
          aspectRatio,
          blurredUrl,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value.trim() === "") {
              modelFields[key] = undefined;
            }
          });
          await DataStore.save(new Photo(modelFields));
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...getOverrideProps(overrides, "PhotoCreateForm")}
      {...rest}
    >
      <TextField
        label="S3key"
        isRequired={true}
        isReadOnly={false}
        value={s3key}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              s3key: value,
              type,
              aspectRatio,
              blurredUrl,
            };
            const result = onChange(modelFields);
            value = result?.s3key ?? value;
          }
          if (errors.s3key?.hasError) {
            runValidationTasks("s3key", value);
          }
          setS3key(value);
        }}
        onBlur={() => runValidationTasks("s3key", s3key)}
        errorMessage={errors.s3key?.errorMessage}
        hasError={errors.s3key?.hasError}
        {...getOverrideProps(overrides, "s3key")}
      ></TextField>
      <TextField
        label="Type"
        isRequired={true}
        isReadOnly={false}
        value={type}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              s3key,
              type: value,
              aspectRatio,
              blurredUrl,
            };
            const result = onChange(modelFields);
            value = result?.type ?? value;
          }
          if (errors.type?.hasError) {
            runValidationTasks("type", value);
          }
          setType(value);
        }}
        onBlur={() => runValidationTasks("type", type)}
        errorMessage={errors.type?.errorMessage}
        hasError={errors.type?.hasError}
        {...getOverrideProps(overrides, "type")}
      ></TextField>
      <TextField
        label="Aspect ratio"
        isRequired={false}
        isReadOnly={false}
        value={aspectRatio}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              s3key,
              type,
              aspectRatio: value,
              blurredUrl,
            };
            const result = onChange(modelFields);
            value = result?.aspectRatio ?? value;
          }
          if (errors.aspectRatio?.hasError) {
            runValidationTasks("aspectRatio", value);
          }
          setAspectRatio(value);
        }}
        onBlur={() => runValidationTasks("aspectRatio", aspectRatio)}
        errorMessage={errors.aspectRatio?.errorMessage}
        hasError={errors.aspectRatio?.hasError}
        {...getOverrideProps(overrides, "aspectRatio")}
      ></TextField>
      <TextField
        label="Blurred url"
        isRequired={false}
        isReadOnly={false}
        value={blurredUrl}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              s3key,
              type,
              aspectRatio,
              blurredUrl: value,
            };
            const result = onChange(modelFields);
            value = result?.blurredUrl ?? value;
          }
          if (errors.blurredUrl?.hasError) {
            runValidationTasks("blurredUrl", value);
          }
          setBlurredUrl(value);
        }}
        onBlur={() => runValidationTasks("blurredUrl", blurredUrl)}
        errorMessage={errors.blurredUrl?.errorMessage}
        hasError={errors.blurredUrl?.hasError}
        {...getOverrideProps(overrides, "blurredUrl")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
