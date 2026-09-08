import { Suspense } from "react";
import Spin from "../components/Spin";
import Verses from "../components/Verses";

export default function QuranWithSurah() {
	return (
		<Suspense fallback={<Spin />}>
			<Verses />
		</Suspense>
	);
}
