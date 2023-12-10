interface SearchQuery {
  filterType: string;
  filterKey: string;
  filterValue: string | null;
  filterOperator: string;
  search: string;
}

const SearchParser = (search: string): SearchQuery | null => {
  search = search.trim();

  if (search.length === 0) {
    return null;
  }

  let [filter, ...filtervalues] = search.split(" ");

  let filterValue = filtervalues.join("").trim();

  if (typeof filterValue !== "string" || filterValue.length === 0) {
    return null;
  }

  const [filterType, filterKey = "id"] = filter.split(":", 2);

  let filterOperator: SearchQuery["filterOperator"] = "=";

  if (/<|>|=/.test(filterValue.substring(0, 1))) {
    filterOperator = filterValue.substring(0, 1);
    filterValue = filterValue.substring(1, filterValue.length).trim();
  } else if (filterValue.includes("..")) {
    filterOperator = "<=>";
  } else {
    throw new Error("invalid search");
  }

  return {
    search: search,
    filterType: filterType,
    filterKey: filterKey,
    filterOperator: filterOperator,
    filterValue: filterValue,
  };
};

export default SearchParser;
