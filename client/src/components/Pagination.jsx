import { useEffect, useState } from "react";

export default function Pagination({
	data = [],
	page,
	setPage,
	RenderComponent,
	pageLimit = 5,
	dataLimit = 10,
}) {
	const pages = Math.ceil(data.length / dataLimit);

	// Initialize shown pages
	const [shownPaginationPages, setShownPaginationPages] = useState([]);

	// Logic to calculate which page numbers to show (Sliding Window)
	const calculatePagination = (currentPage, totalPages, limit) => {
		if (totalPages <= limit) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		// If near the end
		if (currentPage > totalPages - limit) {
			return Array.from(
				{ length: limit },
				(_, i) => totalPages - limit + i + 1,
			);
		}

		// If in the middle
		if (currentPage > Math.floor(limit / 2)) {
			return Array.from(
				{ length: limit },
				(_, i) => currentPage - Math.floor(limit / 2) + i,
			);
		}

		// If near the start
		return Array.from({ length: limit }, (_, i) => i + 1);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: rerenders
	useEffect(() => {
		// Scroll to top when page changes
		window.scrollTo({ behavior: "smooth", top: 0 });
		const newPagination = calculatePagination(page, pages, pageLimit);
		setShownPaginationPages(newPagination);
	}, [page, pages, pageLimit]);

	const goToPage = (pageNumber) => {
		if (pageNumber < 1 || pageNumber > pages) return;
		setPage(pageNumber);
	};

	const getPaginatedData = () => {
		const startIndex = (page - 1) * dataLimit;
		return data.slice(startIndex, startIndex + dataLimit);
	};

	// Button Styles
	const baseBtn =
		"h-10 w-10 flex items-center justify-center rounded-lg border transition-all duration-200 text-sm font-medium";
	const activeBtn =
		"bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105";
	const inactiveBtn =
		"bg-slate-900 text-gray-600 border-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200";
	const disabledBtn =
		"opacity-40 cursor-not-allowed bg-slate-950 text-gray-400 border-slate-800";

	return (
		<div className="space-y-8">
			{/* Content Area */}
			<div className="space-y-0">
				{getPaginatedData().map((d, i) => (
					<RenderComponent key={d.id || i} data={d} />
				))}
			</div>

			{/* Pagination Toolbar */}
			{pages > 1 && (
				<div className="flex flex-wrap justify-center items-center gap-2 py-8">
					{/* First Page */}
					<button
						type="button"
						onClick={() => goToPage(1)}
						disabled={page === 1}
						className={`${baseBtn} ${page === 1 ? disabledBtn : inactiveBtn}`}
						title="First Page"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>First Page</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
							/>
						</svg>
					</button>

					{/* Previous */}
					<button
						type="button"
						onClick={() => goToPage(page - 1)}
						disabled={page === 1}
						className={`${baseBtn} ${page === 1 ? disabledBtn : inactiveBtn}`}
						title="Previous"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Previous</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					{/* Page Numbers */}
					<div className="flex gap-1">
						{shownPaginationPages.map((pageNumber) => (
							<button
								key={pageNumber}
								type="button"
								onClick={() => goToPage(pageNumber)}
								className={`${baseBtn} ${page === pageNumber ? activeBtn : inactiveBtn}`}
							>
								{pageNumber}
							</button>
						))}
					</div>

					{/* Next */}
					<button
						type="button"
						onClick={() => goToPage(page + 1)}
						disabled={page === pages}
						className={`${baseBtn} ${page === pages ? disabledBtn : inactiveBtn}`}
						title="Next"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Next</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>

					{/* Last Page */}
					<button
						type="button"
						onClick={() => goToPage(pages)}
						disabled={page === pages}
						className={`${baseBtn} ${page === pages ? disabledBtn : inactiveBtn}`}
						title="Last Page"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Last Page</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 5l7 7-7 7M5 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			)}
		</div>
	);
}
