import React from "react";

export class ErrorBoundary extends React.Component {
	state = { error: null };

	static getDerivedStateFromError(error) {
		return { error };
	}

	componentDidCatch(error, errorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	tryAgain = () => {
		this.setState({ error: null });
		// Optional: reload the page if simple state reset doesn't work
		// window.location.reload();
	};

	render() {
		if (this.state.error) {
			return (
				<main className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
					<h1 className="text-2xl font-semibold tracking-tight md:text-[32px]">
						Ada masalah semasa memaparkan halaman ini
					</h1>
					<p className="mt-3 text-lg text-muted">
						Cuba semula. Jika masih berlaku, kembali ke halaman utama.
					</p>
					<pre className="mt-6 overflow-x-auto rounded-xl bg-raised p-4 text-[14px] text-muted whitespace-pre-wrap break-words">
						{this.state.error.message}
					</pre>
					<div className="mt-8 flex flex-wrap gap-3">
						<button
							type="button"
							onClick={this.tryAgain}
							className="rounded-full bg-ink px-6 py-3 text-[17px] font-semibold text-ground"
						>
							Cuba semula
						</button>
						<a
							href="/"
							className="rounded-full bg-raised px-6 py-3 text-[17px] font-semibold text-ink hover:bg-line"
						>
							Halaman utama
						</a>
					</div>
				</main>
			);
		}

		return this.props.children;
	}
}
