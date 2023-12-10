import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FilterSearch from "~/Components/FilterSearch";
import { FocusableListProvider } from "~/Components/FocusableList";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export default function Index() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto mt-20 max-w-md">
        <FocusableListProvider>
          <FilterSearch />
        </FocusableListProvider>
      </div>
    </QueryClientProvider>
  );
}
