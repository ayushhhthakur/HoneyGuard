import { useCallback } from "react";

/**
 * `const confirm = useConfirm(); if (await confirm('Remove this member?')) {...}`
 *
 * Centralizes the "are you sure" pattern that was previously inline
 * `window.confirm(...)` calls scattered across Team.js and others. Still
 * backed by the native confirm dialog for now (zero new UI risk), but
 * having one call site means swapping in a themed modal later is a
 * one-file change instead of a grep-and-replace.
 */
export const useConfirm = () =>
  useCallback((message) => Promise.resolve(window.confirm(message)), []);

export default useConfirm;
