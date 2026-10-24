// zones.js — the zone registry on the client: the server's own table
// (controllers/zones.js, via the @zones alias), so there is one list.
import { ZONES } from "@zones";
import { buildZoneIndex } from "./zoneSearch.js";

export const zoneIndex = buildZoneIndex(ZONES);
export const zoneInfo = (code) => (Object.hasOwn(ZONES, code) ? ZONES[code] : null);
// States in table order, for browsing when the search box is empty.
export const STATES = [...new Set(Object.values(ZONES).map((z) => z.negeri))];
