import { Transition } from "@headlessui/react";

import { useNavState } from "../../contexts/NavState";

import "./AppSection.css";

import type { PropsWithChildren } from "react";
import type { NavSection } from "../../types";

export default function AppSection(props: PropsWithChildren<Props>) {
  const { section } = props;
  const { section: currentSection } = useNavState();

  const isSection = section === currentSection;

  return (
    <Transition
      show={isSection}
      enter="transition duration-75"
      enterFrom="opacity-0 scale-0 translate-y-full"
      enterTo="opacity-100 scale-1 translate-y-0"
      leave="transition duration-150"
      leaveFrom="opacity-100 scale-1 translate-y-0"
      leaveTo="opacity-0 scale-0 translate-y-full"
    >
      {props.children}
    </Transition>
  );
}

interface Props {
  section: NavSection;
}
