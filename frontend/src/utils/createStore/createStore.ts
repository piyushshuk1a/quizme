import { create } from 'zustand';
import { type NamedSet, devtools } from 'zustand/middleware';

/**
 * Handles creating a store hook with the given store data along with adding support for devtools
 * @param getStore A function that accepts state setter function as its arguments and returns the store data
 * @returns The create hook using the "create" function from "zustand"
 */
export const createStore = <TStore extends Record<string, unknown>>(
  getStore: (set: NamedSet<TStore>) => TStore,
) =>
  create<TStore>()(
    devtools<TStore>(getStore, {
      enabled: import.meta.env.NODE_ENV === 'development',
    }),
  );
