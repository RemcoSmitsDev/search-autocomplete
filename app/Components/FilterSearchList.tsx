import { type ReactNode } from "react";
import { FocusableListItem } from "./FocusableList";
import { AnimatePresence } from "framer-motion";

export interface FilterType {
  readonly filter: string;
  readonly name: string;
  readonly details?: ReactNode;
  readonly allowOtherFilters?: Array<FilterType["filter"]>;
}

interface FilterSearchListProps {
  filters: Array<FilterType>;
  onItemClick: (element: HTMLLIElement, filter: string) => void;
}

const FilterSearchList: React.FC<FilterSearchListProps> = (props) => {
  return (
    <AnimatePresence>
      {props.filters.map((filter) => (
        <FocusableListItem
          key={filter.filter}
          data-filter={filter.filter}
          aria-description={filter.name}
          onClick={(e) => props.onItemClick(e.currentTarget, filter.filter)}
        >
          <span className="inline-flex w-full flex-grow items-center justify-between p-1.5">
            <span className="inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-light group-hover:bg-gray-50 group-data-[selected]:bg-gray-50">
              {filter.filter}
            </span>
            {filter.details && (
              <span className="text-xs text-gray-500 group-hover:text-gray-200 group-data-[selected]:text-gray-200">
                Ex. {filter.filter} {filter.details}
              </span>
            )}
          </span>
        </FocusableListItem>
      ))}
    </AnimatePresence>
  );
};

export default FilterSearchList;
