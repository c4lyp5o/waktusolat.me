import { useEffect, useState } from "react";

import styles from "../styles/pagination.module.css";

export default function Pagination({
	data = [],
	page,
	setPage,
	RenderComponent,
	pageLimit = 5,
	dataLimit = 10,
}) {
	const pages = Math.ceil(data.length / dataLimit);
	const [shownPaginationPages, setShownPaginationPages] = useState(
		Array.from(
			{ length: Math.min(pages, pageLimit) },
			(_, i) => i + Math.floor((page - 1) / pageLimit) * pageLimit + 1,
		),
	);

	const calculatePagination = (currentPage, totalPages, pageLimit) => {
		if (totalPages <= pageLimit) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}
		if (currentPage > totalPages - pageLimit) {
			return Array.from(
				{ length: pageLimit },
				(_, i) => totalPages - pageLimit + i + 1,
			);
		}
		if (currentPage > Math.floor(pageLimit / 2)) {
			return Array.from(
				{ length: pageLimit },
				(_, i) => currentPage - Math.floor(pageLimit / 2) + i,
			);
		}
		return Array.from({ length: pageLimit }, (_, i) => i + 1);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		window.scrollTo({ behavior: "smooth", top: 0 });
		const newPagination = calculatePagination(page, pages, pageLimit);
		setShownPaginationPages(newPagination);
	}, [page, pages, pageLimit]);

	const goToPage = (pageNumber) => {
		if (pageNumber < 1 || pageNumber > pages) return;
		setPage(pageNumber);
		const newPagination = calculatePagination(pageNumber, pages, pageLimit);
		setShownPaginationPages(newPagination);
	};

	const getPaginatedData = () => {
		const startIndex = (page - 1) * dataLimit;
		return data.slice(startIndex, startIndex + dataLimit);
	};

	return (
		<div className={styles.paginationContainer}>
			<div className={styles.dataContainer}>
				{getPaginatedData().map((d, i) => (
					<RenderComponent key={d.id || i} data={d} />
				))}
			</div>

			{pages > 1 && (
				<div className={styles.pagination}>
					<button
						type="button"
						onClick={() => goToPage(1)}
						disabled={page === 1}
					>
						&laquo;
					</button>
					<button
						type="button"
						onClick={() => goToPage(page - 1)}
						disabled={page === 1}
					>
						&lt;
					</button>

					{shownPaginationPages.map((pageNumber) => (
						<button
							type="button"
							aria-label={`Page ${pageNumber}`}
							aria-current={page === pageNumber ? "page" : undefined}
							key={pageNumber}
							onClick={() => goToPage(pageNumber)}
							className={page === pageNumber ? styles.active : ""}
						>
							{pageNumber}
						</button>
					))}

					<button
						type="button"
						onClick={() => goToPage(page + 1)}
						disabled={page === pages}
					>
						&gt;
					</button>
					<button
						type="button"
						onClick={() => goToPage(pages)}
						disabled={page === pages}
					>
						&raquo;
					</button>
				</div>
			)}
		</div>
	);
}
