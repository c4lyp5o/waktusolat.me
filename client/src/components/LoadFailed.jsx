import React from "react";

export default function LoadFailed() {
	return (
		<div style={styles.container}>
			<h1 style={styles.heading}>Failed to Load</h1>
			<p style={styles.message}>
				Something went wrong while loading the page. Please try again later.
			</p>
		</div>
	);
}

const styles = {
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		height: "100vh",
		textAlign: "center",
		backgroundColor: "#f8d7da",
		color: "#721c24",
		padding: "20px",
	},
	heading: {
		fontSize: "2rem",
		marginBottom: "1rem",
	},
	message: {
		fontSize: "1rem",
	},
};
