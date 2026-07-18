import { useLiveQuery } from "dexie-react-hooks";
import { getProfile } from "../db/queries/profile";

/** `undefined` = still loading; `null` = confirmed no profile yet (onboarding needed). */
export function useProfile() {
  return useLiveQuery(async () => (await getProfile()) ?? null, [], undefined);
}
