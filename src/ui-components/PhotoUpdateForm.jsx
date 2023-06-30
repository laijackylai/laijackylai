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
export default function PhotoUpdateForm(props) {
  const {
    id: idProp,
    photo: photoModelProp,
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
    blurredBase64: "",
  };
  const [s3key, setS3key] = React.useState(initialValues.s3key);
  const [type, setType] = React.useState(initialValues.type);
  const [aspectRatio, setAspectRatio] = React.useState(
    initialValues.aspectRatio
  );
  const [blurredBase64, setBlurredBase64] = React.useState(
    initialValues.blurredBase64
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = photoRecord
      ? { ...initialValues, ...photoRecord }
      : initialValues;
    setS3key(cleanValues.s3key);
    setType(cleanValues.type);
    setAspectRatio(cleanValues.aspectRatio);
    setBlurredBase64(cleanValues.blurredBase64);
    setErrors({});
  };
  const [photoRecord, setPhotoRecord] = React.useState(photoModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? await DataStore.query(Photo, idProp)
        : photoModelProp;
      setPhotoRecord(record);
    };
    queryData();
  }, [idProp, photoModelProp]);
  React.useEffect(resetStateValues, [photoRecord]);
  const validations = {
    s3key: [{ type: "Required" }],
    type: [{ type: "Required" }],
    aspectRatio: [],
    blurredBase64: [],
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
          blurredBase64,
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
          await DataStore.save(
            Photo.copyOf(photoRecord, (updated) => {
              Object.assign(updated, modelFields);
            })
          );
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...getOverrideProps(overrides, "PhotoUpdateForm")}
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
              blurredBase64,
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
              blurredBase64,
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
              blurredBase64,
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
        label="Blurred base64"
        isRequired={false}
        isReadOnly={false}
        value={blurredBase64}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              s3key,
              type,
              aspectRatio,
              blurredBase64: value,
            };
            const result = onChange(modelFields);
            value = result?.blurredBase64 ?? value;
          }
          if (errors.blurredBase64?.hasError) {
            runValidationTasks("blurredBase64", value);
          }
          setBlurredBase64(value);
        }}
        onBlur={() => runValidationTasks("blurredBase64", blurredBase64)}
        errorMessage={errors.blurredBase64?.errorMessage}
        hasError={errors.blurredBase64?.hasError}
        {...getOverrideProps(overrides, "blurredBase64")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || photoModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || photoModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
