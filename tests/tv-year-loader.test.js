// TV display: the year loader behind useYear (cache-first, back-off, one
// request at a time). Regression: under React StrictMode the hook's effect
// started, was torn down and started again; the first fetch's result was
// discarded and the second start backed off, so the TV sat on "Menunggu
// data waktu solat" for 5 minutes.
import { describe, expect, test } from "bun:test";
import { mytEpoch } from "../client/src/tv/lib/mytime.js";
import { createYearLoader } from "../client/src/tv/lib/yearLoader.js";
import { timeCruncher } from "../controllers/helpers.js";
import { makeYearPayload } from "./fixtures.js";

const body = {
	zone: "KUALA LUMPUR DAN PUTRAJAYA",
	negeri: "Wilayah Persekutuan Kuala Lumpur",
	data: timeCruncher("year", { db: makeYearPayload(2026).prayerTime }),
};
const noon = mytEpoch(2026, 10, 22, 12, 0);
const MIN = 60_000;

function memoryStorage() {
	const map = new Map();
	return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) };
}

// A fetch whose responses resolve when the test says so.
function controlledFetch() {
	const calls = [];
	const fetchImpl = (url) => new Promise((resolve, reject) => calls.push({ url, resolve, reject }));
	const respond = (i, status, json) =>
		calls[i].resolve({ ok: status >= 200 && status < 300, status, json: async () => json });
	return { fetchImpl, calls, respond };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("createYearLoader", () => {
	test("two overlapping refreshes (StrictMode double effect) make one request and apply it", async () => {
		const { fetchImpl, calls, respond } = controlledFetch();
		const updates = [];
		const loader = createYearLoader({
			zone: "wly01",
			fetchImpl,
			storage: memoryStorage(),
			onUpdate: (u) => updates.push(u),
		});
		loader.refresh(noon);
		loader.refresh(noon); // second mount of the same effect
		expect(calls).toHaveLength(1);
		expect(calls[0].url).toBe("/api/v1/waktusolat/year/wly01");
		respond(0, 200, body);
		await flush();
		expect(updates.at(-1)).toMatchObject({
			status: "ready",
			meta: { area: "KUALA LUMPUR DAN PUTRAJAYA" },
		});
		expect(updates.at(-1).days).toHaveLength(365);
	});

	test("starts from the cache and does not refetch while it is fresh", async () => {
		const storage = memoryStorage();
		const first = controlledFetch();
		const a = createYearLoader({
			zone: "wly01",
			fetchImpl: first.fetchImpl,
			storage,
			onUpdate: () => {},
		});
		a.refresh(noon);
		first.respond(0, 200, body);
		await flush();

		const second = controlledFetch();
		const updates = [];
		const b = createYearLoader({
			zone: "wly01",
			fetchImpl: second.fetchImpl,
			storage,
			onUpdate: (u) => updates.push(u),
		});
		expect(b.initial()).toMatchObject({ status: "ready" });
		b.refresh(noon + MIN);
		expect(second.calls).toHaveLength(0);
	});

	test("after a failure it waits 5 minutes before retrying; success clears the back-off", async () => {
		const { fetchImpl, calls, respond } = controlledFetch();
		const updates = [];
		const loader = createYearLoader({
			zone: "wly01",
			fetchImpl,
			storage: memoryStorage(),
			onUpdate: (u) => updates.push(u),
		});
		loader.refresh(noon);
		calls[0].reject(new Error("offline"));
		await flush();
		loader.refresh(noon + 4 * MIN);
		expect(calls).toHaveLength(1);
		loader.refresh(noon + 5 * MIN);
		expect(calls).toHaveLength(2);
		respond(1, 200, body);
		await flush();
		expect(updates.at(-1).status).toBe("ready");
	});

	test("400 is an unknown zone; 404 with no cache is no data yet", async () => {
		for (const [status, expected] of [
			[400, "unknown-zone"],
			[404, "no-data"],
		]) {
			const { fetchImpl, respond } = controlledFetch();
			const updates = [];
			const loader = createYearLoader({
				zone: "xyz99",
				fetchImpl,
				storage: memoryStorage(),
				onUpdate: (u) => updates.push(u),
			});
			loader.refresh(noon);
			respond(0, status, { message: "x" });
			await flush();
			expect(updates.at(-1).status).toBe(expected);
		}
	});

	test("a failed refresh keeps serving the cached year", async () => {
		const storage = memoryStorage();
		const first = controlledFetch();
		createYearLoader({
			zone: "wly01",
			fetchImpl: first.fetchImpl,
			storage,
			onUpdate: () => {},
		}).refresh(noon);
		first.respond(0, 200, body);
		await flush();

		const second = controlledFetch();
		const updates = [];
		const loader = createYearLoader({
			zone: "wly01",
			fetchImpl: second.fetchImpl,
			storage,
			onUpdate: (u) => updates.push(u),
		});
		loader.refresh(noon + 7 * 60 * MIN); // 7 h later: stale, refetches
		second.respond(0, 500, {});
		await flush();
		expect(updates.every((u) => u.status === "ready")).toBe(true);
		expect(loader.initial().days).toHaveLength(365);
	});
});
