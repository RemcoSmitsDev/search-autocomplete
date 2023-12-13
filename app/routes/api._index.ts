import { type LoaderFunctionArgs, json } from "@remix-run/node";

const orders = [
  {
    id: "b26955c1-d946-4761-bacc-84642cdaa36d",
    amount: 10,
    currency: "EUR",
    status: "authorised",
  },
  {
    id: "5b7d8e6e-d58c-4af1-96f1-0d0ed5b827d2",
    amount: 500,
    currency: "EUR",
    status: "pending",
  },
  {
    id: "22bf2dd0-0a3f-4a38-bc5d-5536b7e7c750",
    amount: 9,
    currency: "USD",
    status: "captured",
  },
  {
    id: "9f0c8296-a8bb-44fc-903a-0c02a7546782",
    amount: 320,
    currency: "USD",
    status: "initialised",
  },
] as const;

const payments = [
  {
    id: "4980a59c-7dcd-45ce-9470-ad4dd9c51171",
    amount: 100,
    currency: "EUR",
    paymentMethod: "visa",
    status: "captured",
  },
  {
    id: "8d36d130-d2a8-4919-bc66-d7464b696c36",
    amount: 5,
    currency: "USD",
    paymentMethod: "ideal",
    status: "pending",
  },
  {
    id: "713dd187-bf45-448a-8c00-398208a09be1",
    amount: 80,
    currency: "EUR",
    paymentMethod: "mastercard",
    status: "authorised",
  },
  {
    id: "5b38c398-56ce-481a-994e-00d144248994",
    amount: 120,
    currency: "USD",
    paymentMethod: "paypal",
    status: "captured",
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
