import React from "react";

// ErrorBoundary Component
export class ErrorBoundary extends React.Component {
	state = { error: null };

	static getDerivedStateFromError(error) {
		return { error };
	}

	componentDidCatch(error, errorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	tryAgain = () => this.setState({ error: null });

	render() {
		return this.state.error ? (
			<div>
				<h2>Something went wrong.</h2>
				<button type="button" onClick={this.tryAgain}>
					Try Again
				</button>
				<pre style={{ whiteSpace: "normal" }}>{this.state.error.message}</pre>
			</div>
		) : (
			this.props.children
		);
	}
}
