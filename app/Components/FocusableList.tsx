import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  forwardRef,
  useContext,
  useRef,
  useState,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactNode,
} from "react";

interface FocusListContextInterface {
  focusedElement: HTMLElement | null;
  setFocusedElement: (element: HTMLElement | null) => void;
}

interface FocusListProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

interface ListRootProps {
  children: ReactNode;
}

interface ListItemProps extends HTMLAttributes<HTMLLIElement> {}

export const FocusListContext = createContext<FocusListContextInterface>({
  focusedElement: null,
  setFocusedElement: () => {
    throw new Error("Must wrap context provider");
  },
});

const FocusableList = forwardRef<HTMLUListElement, FocusListProps>(
  function FocusableList(props, ref) {
    const { children, ...rest } = props;
    return (
      <ul
        {...rest}
        ref={ref}
        role="menu"
        className="relative"
        aria-orientation="vertical"
      >
        <AnimatePresence initial={false}>{children}</AnimatePresence>
      </ul>
    );
  },
);

const FocusableListProvider: React.FC<ListRootProps> = (props) => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(
    null,
  );

  return (
    <FocusListContext.Provider value={{ focusedElement, setFocusedElement }}>
      {props.children}
    </FocusListContext.Provider>
  );
};

const FocusableListItem: React.FC<ListItemProps> = (props) => {
  const context = useContext(FocusListContext);

  const ref = useRef<HTMLLIElement>(null);

  const attributes =
    ref.current && ref.current === context.focusedElement
      ? { "data-selected": true }
      : {};

  return (
    <motion.li
      {...props}
      {...attributes}
      ref={ref}
      tabIndex={-1}
      role="menuitem"
      layout
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      exit={{ height: 0 }}
      onClick={(e) => {
        props?.onClick && props?.onClick(e);
        context.setFocusedElement(e.currentTarget);
      }}
      className="group cursor-pointer overflow-hidden bg-white text-sm hover:bg-indigo-400 data-[selected]:bg-indigo-400"
    />
  );
};

const findNextFocusableElement = (
  element: HTMLElement | null,
  list: HTMLUListElement | null,
): HTMLElement | null => {
  if (element instanceof HTMLElement === false) {
    return list?.querySelector("li") as HTMLElement;
  }

  if (element?.nodeName === "LI" && element.hidden === false) {
    return element;
  }

  return findNextFocusableElement(
    element.nextElementSibling as HTMLElement,
    list,
  );
};

const findPreviousFocusableElement = (
  element: HTMLElement | null,
  list: HTMLUListElement | null,
): HTMLElement | null => {
  if (element instanceof HTMLElement === false) {
    return list?.querySelector("li") as HTMLElement;
  }

  if (element?.nodeName === "LI" && element.hidden === false) {
    return element;
  }

  return findNextFocusableElement(
    element.previousElementSibling as HTMLElement,
    list,
  );
};

export {
  FocusableList,
  FocusableListItem,
  FocusableListProvider,
  findNextFocusableElement,
  findPreviousFocusableElement,
};
