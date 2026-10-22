// TV display: Malay date/time formatting (all in Malaysia time).
import { expect, test } from "bun:test";
import {
	areaName,
	formatClock,
	formatCountdown,
	formatDate,
	formatTime,
} from "../client/src/tv/lib/format.js";
import { mytEpoch } from "../client/src/tv/lib/mytime.js";

test("times are 24-hour Malaysia wall time", () => {
	expect(formatTime(mytEpoch(2026, 10, 22, 6, 0))).toBe("06:00");
	expect(formatTime(mytEpoch(2026, 10, 22, 20, 30))).toBe("20:30");
	expect(formatClock(mytEpoch(2026, 10, 22, 9, 5, 7))).toEqual({ hm: "09:05", s: "07" });
});

test("dates in Malay, day name first", () => {
	expect(formatDate(mytEpoch(2026, 10, 22, 12, 0))).toBe("Khamis, 22 Oktober 2026");
	expect(formatDate(mytEpoch(2026, 10, 23, 0, 30))).toBe("Jumaat, 23 Oktober 2026");
	expect(formatDate(mytEpoch(2027, 1, 3, 12, 0))).toBe("Ahad, 3 Januari 2027");
});

test("countdown: h:mm:ss from an hour, mm:ss under it, never negative", () => {
	const s = 1000;
	expect(formatCountdown(5025 * s)).toBe("1:23:45");
	expect(formatCountdown(3600 * s)).toBe("1:00:00");
	expect(formatCountdown(3599 * s)).toBe("59:59");
	expect(formatCountdown(65 * s)).toBe("01:05");
	expect(formatCountdown(500)).toBe("00:01"); // rounds up: never shows 00:00 early
	expect(formatCountdown(0)).toBe("00:00");
	expect(formatCountdown(-4000)).toBe("00:00");
});

test("JAKIM's capitalised area names in title case, joining words lower", () => {
	expect(areaName("KUALA LUMPUR DAN PUTRAJAYA")).toBe("Kuala Lumpur dan Putrajaya");
	expect(areaName("PETALING/SHAH ALAM, HULU LANGAT DAN SEPANG")).toBe(
		"Petaling/Shah Alam, Hulu Langat dan Sepang",
	);
	expect(areaName("SG. SIPUT DAN KUALA KANGSAR")).toBe("Sg. Siput dan Kuala Kangsar");
	expect(areaName(null)).toBe("");
});
