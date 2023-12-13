import { type HTMLAttributes, forwardRef } from "react";

interface AutoCompleteInputProps extends HTMLAttributes<HTMLInputElement> {
  value: string;
  setValue: (value: string) => void;
  autoComplete: string | null;
}

const AutoCompleteInput = forwardRef<HTMLInputElement, AutoCompleteInputProps>(
  function AutoCompleteInput(props, ref) {
    const { value, setValue, autoComplete, ...rest } = props;

    let displayAutocomplete: string | null = null;

    if (
      autoComplete &&
      autoComplete.length > 0 &&
      autoComplete.toLowerCase().startsWith(value.toLowerCase())
    ) {
      displayAutocomplete = autoComplete;
    }

    return (
      <div className="relative inline-block w-full">
        <span className="pointer-events-none absolute left-px top-px select-none px-3 py-2 text-sm text-gray-700">
          <span className="invisible">{value}</span>
          {displayAutocomplete && (
            <span className="text-gray-500">
              {displayAutocomplete.replace(new RegExp(`^${value}`, "i"), "")}
            </span>
          )}
        </span>
        <input
          {...rest}
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (
              e.code === "Tab" &&
              autoComplete &&
              autoComplete.startsWith(e.currentTarget.value)
            ) {
              setValue(autoComplete);
              e.preventDefault();
            } else if (
              e.code === "ArrowRight" &&
              autoComplete &&
              e.currentTarget.value.length === e.currentTarget.selectionStart &&
              e.currentTarget.selectionStart === e.currentTarget.selectionEnd
            ) {
              setValue(
                autoComplete.substring(0, e.currentTarget.selectionStart + 1),
              );
              e.preventDefault();
            }
          }}
          placeholder={autoComplete ? undefined : "Search..."}
          className="boder-gray-200 w-full rounded-md border py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-gray-300 focus:outline-none"
        />
      </div>
    );
  },
);

export default AutoCompleteInput;
