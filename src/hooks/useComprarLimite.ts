import { useSyncExternalStore } from "react";

type State = { open: boolean };
let state: State = { open: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const comprarLimiteStore = {
  open: () => { state = { open: true }; emit(); },
  close: () => { state = { open: false }; emit(); },
  setOpen: (o: boolean) => { state = { open: o }; emit(); },
};

export function useComprarLimite() {
  const open = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => state.open,
    () => state.open,
  );
  return { open, setOpen: comprarLimiteStore.setOpen };
}
