// LinkCard.jsx — one link shown whole, with Salin, WhatsApp and Buka.
import { useState } from "react";
import { BTN_SOFT } from "./ui.js";

export default function LinkCard({
	title,
	path,
	children,
	whatsapp = false,
	open = false,
	big = false,
}) {
	const url = `${window.location.origin}${path}`;
	const [copied, setCopied] = useState(false);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		} catch {
			setCopied(false);
		}
	};
	return (
		<section className="rounded-2xl bg-surface p-5">
			<h3 className="text-[17px] font-semibold">{title}</h3>
			<p
				className={`mt-2 break-all font-semibold text-ink [font-feature-settings:"calt"_0] ${big ? "text-[22px] leading-snug" : "text-[17px]"}`}
			>
				{url.replace(/^https?:\/\//, "")}
			</p>
			{children && <div className="mt-2 text-[15px] text-muted">{children}</div>}
			<div className="mt-4 flex flex-wrap gap-2">
				<button type="button" onClick={copy} className={BTN_SOFT}>
					{copied ? "Disalin" : "Salin"}
				</button>
				{whatsapp && (
					<a
						href={`https://wa.me/?text=${encodeURIComponent(url)}`}
						target="_blank"
						rel="noreferrer"
						className={BTN_SOFT}
					>
						Kongsi ke WhatsApp
					</a>
				)}
				{open && (
					<a href={path} target="_blank" rel="noreferrer" className={BTN_SOFT}>
						Buka
					</a>
				)}
			</div>
		</section>
	);
}
