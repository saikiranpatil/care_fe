import { Label } from "@radix-ui/react-label";

import { FieldError } from "@/components/Form/FieldValidators";
import { FormFieldBaseProps } from "@/components/Form/FormFields/Utils";

import { classNames } from "@/Utils/utils";

type LabelProps = {
  id?: string | undefined;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string | undefined;
  noPadding?: boolean;
};

export const FieldLabel = (props: LabelProps) => {
  return (
    <Label
      id={props.id}
      className={classNames(
        "block text-base font-normal text-secondary-900",
        !props.noPadding && "mb-2",
        props.className,
      )}
      htmlFor={props.htmlFor}
    >
      {props.children}
      {props.required && <span className="text-danger-500">{" *"}</span>}
    </Label>
  );
};

type ErrorProps = {
  error: FieldError;
  className?: string | undefined;
};

export const FieldErrorText = (props: ErrorProps) => {
  return (
    <span
      className={classNames(
        "error-text ml-1 mt-2 text-xs font-medium tracking-wide text-danger-500 transition-opacity duration-300",
        props.error ? "opacity-100" : "opacity-0",
        props.className,
      )}
    >
      {props.error}
    </span>
  );
};

type MessageProps = {
  message: string | undefined;
  className?: string | undefined;
};

export const FieldMessageText = (props: MessageProps) => {
  return (
    <span
      className={classNames(
        "text-secondary-700 ml-1 mt-2 text-xs tracking-wide transition-opacity duration-300",
        props.message ? "opacity-80" : "opacity-0",
        props.className,
      )}
    >
      {props.message}
    </span>
  );
};

const FormField = ({
  field,
  ...props
}: {
  field?: FormFieldBaseProps<any>;
  children: React.ReactNode;
}) => {
  return (
    <div className={field?.className}>
      <div className="flex items-center justify-between">
        {field?.label && (
          <FieldLabel
            htmlFor={field?.id}
            required={field?.required}
            className={field?.labelClassName}
          >
            {field?.label}
          </FieldLabel>
        )}
        {field?.labelSuffix && (
          <span className="mb-2 text-xs">{field?.labelSuffix}</span>
        )}
      </div>
      <div className={field?.className}>{props.children}</div>
      <FieldErrorText error={field?.error} className={field?.errorClassName} />
      <FieldMessageText
        message={field?.message}
        className={field?.messageClassName}
      />
    </div>
  );
};

export default FormField;
