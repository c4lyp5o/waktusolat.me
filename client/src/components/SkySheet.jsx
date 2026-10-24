// SkySheet.jsx — the frame of every page but the zone page and the TV
// (SPEC-redesign.md): the navbar's sky runs on a little, then the page sits
// on the sheet, so long reading (Quran, hadith) is never set on a coloured
// sky. As a layout route it renders the matched page; Landing wraps its
// zone picker in it directly.
import { Outlet, useLocation } from "react-router";
import useZoneSky, { skyZone } from "./useZoneSky.js";

export default function SkySheet({ children }) {
	const { pathname } = useLocation();
	const sky = useZoneSky(skyZone(pathname));
	return (
		// Padding, not the sheet's margin: a margin would collapse through this
		// wrapper and show the plain ground instead of the sky.
		<div className={`pt-2 md:pt-4 ${sky ? "sky" : ""}`} data-sky={sky ?? undefined}>
			{/* At least the screen below the navbar (and, on phones, above the
			    bottom bar), so the sky never shows under a short page. */}
			<div className="sheet min-h-[calc(100dvh-3.5rem-3.5rem-env(safe-area-inset-bottom))] rounded-t-[28px] md:min-h-[calc(100dvh-5rem)] md:rounded-t-[40px]">
				{children ?? <Outlet />}
			</div>
		</div>
	);
}
