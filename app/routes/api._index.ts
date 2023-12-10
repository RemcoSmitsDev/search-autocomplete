import { type LoaderFunctionArgs, json } from "@remix-run/node";

const orders = [
  {
    id: "pi_1Ge4kEGzJT0kic6Bv8amuSHJ",
    amount: 10,
    currency: "EUR",
    status: "captured",
  },
  {
    id: "pi_1Ghajsdkha0kic6Bv8amuSHJ",
    amount: 500,
    currency: "USD",
    status: "pending",
  },
] as const;

const payments = [
  {
    id: "pi_1Ge4kEGzJT0kic6Bv8amuSHJ",
    amount: 100,
    currency: "EUR",
    paymentMethod: "klarna",
    status: "captured",
  },
  {
    id: "pi_1Ghajsdkha0kic6Bv8amuSHJ",
    amount: 5,
    currency: "USD",
    paymentMethod: "ideal",
    status: "pending",
  },
] as const;

function filterFunction(
  filterOperator: string,
  value: any,
  filterValue: string,
): boolean {
  if (filterOperator === "<=>") {
    return (
      filterFunction(">", value, filterValue.split("..", 2)[0]) &&
      filterFunction("<", value, filterValue.split("..", 2)[1])
    );
  } else if (filterOperator === ">") {
    return (
      parseFloat((parseInt(value) / 100).toString()) >= parseFloat(filterValue)
    );
  } else if (filterOperator === "<") {
    return (
      parseFloat((parseInt(value) / 100).toString()) <= parseFloat(filterValue)
    );
  } else if (
    isNaN(Number(value)) === false &&
    isNaN(Number(filterValue)) === false
  ) {
    return (
      parseFloat((parseInt(value) / 100).toString()) === parseFloat(filterValue)
    );
  }

  return String(value).toLowerCase() == filterValue.toLowerCase();
}

export async function loader({ request }: LoaderFunctionArgs) {
  await new Promise((res) => setTimeout(res, 1500));

  const url = new URL(request.url);

  const filterType = url.searchParams.get("filterType");
  const filterKey = url.searchParams.get("filterKey");
  const filterOperator = url.searchParams.get("filterOperator");
  const filterValue = url.searchParams.get("filterValue");

  if (
    filterType === null ||
    filterKey === null ||
    filterOperator === null ||
    filterValue === null
  ) {
    return Response.error();
  }

  let items: Array<(typeof payments)[number] | (typeof orders)[number]> = [];

  if (filterType === "order") {
    items = orders.filter((order) =>
      filterFunction(
        filterOperator,
        order[(filterKey as keyof typeof order) || "id"],
        filterValue,
      ),
    );
  } else if (filterType === "payment") {
    items = payments.filter((payment) =>
      filterFunction(
        filterOperator,
        payment[(filterKey as keyof typeof payment) || "id"],
        filterValue,
      ),
    );
  }

  return json({
    filterType,
    filterKey,
    filterOperator,
    filterValue,
    items,
  });
}
