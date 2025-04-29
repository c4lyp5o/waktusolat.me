import { Suspense } from "react";
import Verses from "../components/Verses";
import Spin from "../components/Spin";

export default function QuranWithSurah() {
	return (
		<Suspense fallback={<Spin />}>
			<Verses />
		</Suspense>
	);
}
