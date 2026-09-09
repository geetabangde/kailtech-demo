// Import Dependencies
import PropTypes from "prop-types";
import { forwardRef, useEffect, useRef } from "react";
import clsx from "clsx";

// Local Imports
import { ApplyWrapper } from "components/shared/ApplyWrapper";
import { mergeRefs } from "hooks";
import { setThisClass } from "utils/setThisClass";

// ----------------------------------------------------------------------

const disabledClass =
  "before:[mask-image:var(--tw-thumb)] before:bg-gray-400 border-gray-150 bg-gray-150 pointer-events-none select-none opacity-70 dark:bg-dark-450 dark:border-dark-450 dark:before:bg-dark-800 dark:opacity-60";

const variants = {
  basic:
    "border-gray-400/70 bg-origin-border before:bg-center before:bg-no-repeat before:[background-size:100%_100%] before:[background-image:var(--tw-thumb)] checked:border-primary-600 checked:bg-primary-600 indeterminate:border-primary-600 indeterminate:bg-primary-600 hover:border-primary-600 focus:border-primary-600 dark:border-dark-400 dark:checked:border-primary-500 dark:checked:bg-primary-500 dark:indeterminate:border-primary-500 dark:indeterminate:bg-primary-500 dark:hover:border-primary-500 dark:focus:border-primary-500",
  outlined:
    "border-gray-400/70 before:bg-primary-600 before:[mask-image:var(--tw-thumb)] checked:border-primary-600 hover:border-primary-600 focus:border-primary-600 dark:border-dark-400 dark:hover:border-primary-500 dark:focus:border-primary-500 dark:before:bg-primary-500 dark:checked:border-primary-500",
};

const Checkbox = forwardRef((props, ref) => {
  const {
    variant = "basic",
    unstyled,
    color = "primary",
    type = "checkbox",
    className,
    classNames = {},
    label,
    disabled,
    indeterminate,
    labelProps,
    ...rest
  } = props;

  const inputRef = useRef();

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <ApplyWrapper
      when={!!label}
      wrapper={(children) => (
        <label
          className={clsx(
            "input-label inline-flex items-center gap-2",
            classNames?.label,
          )}
          {...labelProps}
        >
          {children}
          <span className={clsx("label", classNames?.labelText)}>{label}</span>
        </label>
      )}
    >
      <input
        className={clsx(
          "form-checkbox",
          !unstyled && [
            setThisClass(color),
            disabled ? disabledClass : variants[variant],
          ],
          className,
          classNames?.input,
        )}
        disabled={disabled}
        data-disabled={disabled}
        data-indeterminate={indeterminate}
        ref={mergeRefs(inputRef, ref)}
        type={type}
        {...rest}
      />
    </ApplyWrapper>
  );
});

Checkbox.displayName = "Checkbox";

Checkbox.propTypes = {
  variant: PropTypes.oneOf(["outlined", "basic"]),
  unstyled: PropTypes.bool,
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
  ]),
  type: PropTypes.string,
  className: PropTypes.string,
  classNames: PropTypes.object,
  label: PropTypes.node,
  disabled: PropTypes.bool,
  indeterminate: PropTypes.bool,
  labelProps: PropTypes.object,
};

export { Checkbox };
