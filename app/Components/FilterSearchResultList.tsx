import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { FocusableListItem } from "./FocusableList";
import useDebounce from "~/Hooks/useDebounce";
import { AnimatePresence } from "framer-motion";
import SearchParser from "~/Util/SearchParser";

interface FilterSearchResultListProps {
  search: string;
}

interface ResponseItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface ResponseData {
  query: string;
  filterOperator: string;
  items: Array<ResponseItem>;
}

const FilterSearchResultList: React.FC<FilterSearchResultListProps> = (
  props,
) => {
  const debouncedSearch = useDebounce(props.search.trim(), 500);

  const { data, isError } = useQuery<ResponseData>({
    queryKey: ["search", debouncedSearch],
    queryFn: async ({ signal }) => {
      const searchQuery = SearchParser(debouncedSearch);

      if (searchQuery === null) {
        return null;
      }

      const url = new URL("/api", window.location.origin);
      url.searchParams.append("filterType", searchQuery.filterType);
      url.searchParams.append("filterKey", searchQuery.filterKey);
      url.searchParams.append("filterValue", searchQuery.filterValue || "");
      url.searchParams.append("filterOperator", searchQuery.filterOperator);
      url.searchParams.append("search", searchQuery.search);

      const response = await fetch(url, { signal });

      if (response.ok) {
        return await response.json();
      }

      return null;
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    return null;
  }

  return (
    <>
      {Array.isArray(data?.items) && data.items.length > 0 && <hr />}
      <AnimatePresence>
        {data?.items?.map((item) => (
          <FocusableListItem key={item.id}>
            <span className="flex w-full items-center justify-between p-1.5 text-xs text-gray-700 group-hover:text-gray-200 group-data-[selected]:text-gray-200">
              <span className="w-1/4 text-left">
                {formatAmount(item.amount, item.currency)}
              </span>
              <span className="w-2/4 truncate">{item.id}</span>
              <span className="w-1/4 text-right">{item.status}</span>
            </span>
          </FocusableListItem>
        ))}
      </AnimatePresence>
    </>
  );
};

const formatAmount = (value: number, currency: string) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export default FilterSearchResultList;
