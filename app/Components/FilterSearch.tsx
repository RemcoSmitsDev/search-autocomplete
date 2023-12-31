import {
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
} from "@heroicons/react/24/solid";
import * as Portal from "@radix-ui/react-portal";
import { useIsFetching } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ClientOnly } from "remix-utils/client-only";
import AutoCompleteInput from "./AutoCompleteInput";
import FilterSearchList, { type FilterType } from "./FilterSearchList";
import FilterSearchResultList from "./FilterSearchResultList";
import {
  FocusListContext,
  FocusableList,
  findNextFocusableElement,
  findPreviousFocusableElement,
} from "./FocusableList";
import LoadingSpinner from "./LoadingSpinner";

const filters: Array<FilterType> = [
  { filter: "payment", name: "Payment", details: "12X889013" },
  { filter: "payment:currency", name: "Currency", details: "EUR" },
  { filter: "payment:amount", name: "payment:amount", details: "> 0.01" },
  { filter: "order", name: "Order", details: "12X889013" },
  { filter: "order:currency", name: "Currency", details: "EUR" },
  { filter: "order:amount", name: "order:amount", details: "0.02" },
] as const;

const FilterSearch: React.FC = () => {
  const [value, setValue] = useState<string>("");
  const [autoComplete, setAutoComplete] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const focusListRef = useRef<HTMLUListElement>(null);

  const { focusedElement, setFocusedElement } = useContext(FocusListContext);

  const filterdFilters = filters.filter(
    (filter) =>
      filter.filter.startsWith(value) ||
      value.startsWith(filter.filter) ||
      value.toLowerCase().includes(filter.filter.toLowerCase()),
  );

  useEffect(() => {
    const handleKeydown = (event: React.KeyboardEvent<any>) => {
      if (event.code === "ArrowDown") {
        const focusNewElement = findNextFocusableElement(
          focusedElement?.nextElementSibling as HTMLElement,
          focusListRef.current,
        );

        setAutoComplete(focusNewElement?.dataset?.filter || autoComplete);
        setFocusedElement(focusNewElement);

        event.preventDefault();
      } else if (event.code === "ArrowUp") {
        const focusNewElement = findPreviousFocusableElement(
          focusedElement?.previousElementSibling as HTMLElement,
          focusListRef.current,
        );

        setAutoComplete(focusNewElement?.dataset?.filter || autoComplete);
        setFocusedElement(focusNewElement);

        event.preventDefault();
      } else if (
        event.code === "Enter" &&
        focusedElement &&
        focusedElement.hasAttribute("data-filter")
      ) {
        setValue(focusedElement.dataset.filter as string);
        setFocusedElement(null);
        event.preventDefault();
      } else if (event.code === "Escape") {
        setFocusedElement(null);
        setAutoComplete(null);
      }
    };

    const inputElement = inputRef.current;

    inputElement?.addEventListener("keydown", handleKeydown);

    return () => inputElement?.removeEventListener("keydown", handleKeydown);
  }, [inputRef, focusedElement, autoComplete, setFocusedElement]);

  const isFetching = useIsFetching({ queryKey: ["search"] });

  return (
    <>
      <span className="relative inline-block w-full overflow-hidden rounded-md">
        <AutoCompleteInput
          ref={inputRef}
          value={value}
          setValue={(value) => {
            setValue(value);

            if (focusedElement === null) {
              setAutoComplete(
                filterdFilters.find(
                  ({ filter }) => value && filter.startsWith(value),
                )?.filter || null,
              );
            }

            if (value.length === 0) {
              setFocusedElement(null);
            }
          }}
          autoComplete={autoComplete}
        />
        <AnimatePresence>
          {isFetching > 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 mr-3 flex items-center justify-end"
            >
              <LoadingSpinner className="h-4 w-4 text-gray-300" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <ClientOnly>
        {() => (
          <Portal.Root asChild>
            <div className="fixed left-1/2 mt-2 flex w-full max-w-md flex-shrink-0 flex-grow -translate-x-1/2 flex-col overflow-hidden rounded-md bg-white shadow-sm">
              <FocusableList ref={focusListRef}>
                <FilterSearchList
                  key="filter-search-list"
                  filters={filterdFilters}
                  onItemClick={(element, value) => {
                    setValue(value);

                    inputRef.current?.focus();
                    setFocusedElement(element);
                  }}
                />

                <FilterSearchResultList
                  search={value}
                  key="filter-search-result-list"
                />
              </FocusableList>
              <div className="mt-2 flex items-center justify-between space-x-2 bg-gray-50 px-2 py-1">
                <ShortcutInfo
                  shortcut={
                    <span className="flex items-center space-x-0.5">
                      <ArrowSmallUpIcon className="h-3 w-3" />
                      <ArrowSmallDownIcon className="h-3 w-3" />
                    </span>
                  }
                  description="select"
                />
                <ShortcutInfo shortcut="Tab" description="autocomplete" />
                <ShortcutInfo shortcut="Enter" description="select" />
                <ShortcutInfo shortcut="ESC" description="hide" />
              </div>
            </div>
          </Portal.Root>
        )}
      </ClientOnly>
    </>
  );
};

interface ShortcutInfoProps {
  shortcut: ReactNode;
  description: string;
}

const ShortcutInfo: React.FC<ShortcutInfoProps> = (props) => {
  return (
    <span className="flex flex-nowrap items-center space-x-1.5 whitespace-nowrap text-xs text-gray-500">
      <span className="rounded-md bg-gray-200 px-1.5 py-0.5">
        {props.shortcut}
      </span>
      <span>{props.description}</span>
    </span>
  );
};

export default FilterSearch;
