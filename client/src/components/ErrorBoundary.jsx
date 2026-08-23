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
				<div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans space-y-8">
					{/* Warning Icon with Red Glow */}
					<div className="relative">
						<div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full pointer-events-none"></div>
						<div className="relative bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-2xl">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-12 w-12 text-red-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Warning Icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
					</div>

					{/* Heading */}
					<div className="space-y-3 max-w-md">
						<h2 className="text-3xl font-bold text-slate-100">
							Alamak! Ada Masalah.
						</h2>
						<p className="text-slate-400 leading-relaxed">
							Aplikasi telah menghadapi ralat yang tidak dijangka. Jangan risau,
							ini bukan salah anda.
						</p>
					</div>

					{/* Technical Error Box (Styled Terminal) */}
					<div className="w-full max-w-lg bg-slate-900/80 rounded-xl border border-slate-800 p-4 text-left overflow-hidden shadow-inner">
						<div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
							<div className="w-2 h-2 rounded-full bg-red-500"></div>
							<div className="w-2 h-2 rounded-full bg-yellow-500"></div>
							<div className="w-2 h-2 rounded-full bg-green-500"></div>
							<span className="text-xs text-slate-500 font-mono ml-2 uppercase">
								Error Log
							</span>
						</div>
						<pre className="text-xs text-red-400 font-mono whitespace-pre-wrap break-words">
							{this.state.error.message}
						</pre>
					</div>

					{/* Action Button */}
					<button
						type="button"
						onClick={this.tryAgain}
						className="px-8 py-3 rounded-full bg-acre-600 hover:bg-acre-700 text-white font-medium transition-all hover:scale-105 shadow-lg shadow-acre-900/20 flex items-center gap-2"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<title>Refresh</title>
							<path
								fillRule="evenodd"
								d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v3.276a1 1 0 01-2 0V13.107a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
								clipRule="evenodd"
							/>
						</svg>
						Cuba Semula
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}
