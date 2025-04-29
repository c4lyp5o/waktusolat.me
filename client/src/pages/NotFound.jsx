import React from "react";
import { Link } from "react-router";

export default function NotFound() {
	return (
		<>
			<title>404</title>
			<meta name="description" content="Not Found" />
			<main className="container">
				<section style={{ textAlign: "center", marginTop: "5rem" }}>
					<h1>404</h1>
					<p>Oops! The page you're looking for doesn't exist.</p>
					<Link to="/" className="contrast">
						Go Back Home
					</Link>
				</section>
			</main>
		</>
	);
}
