const STATIONS = [
	{
		id: "rodja",
		name: "Radio Rodja",
		location: "Bogor, Indonesia",
		url: "https://radioonline.co.id/#rodja",
		logo: "https://cdn.webrad.io/images/logos/radioonline-co-id/rodja.png",
		stream: "https://radioislamindonesia.com/rodja.mp3?_=2",
	},
	{
		id: "muslim",
		name: "Radio Muslim",
		location: "Yogyakarta, Indonesia",
		url: "https://radioonline.co.id/#muslim",
		logo: "https://cdn.webrad.io/images/logos/radioonline-co-id/muslim.png",
		stream: "https://cp.phpmystream.com/radioSSLnew/s/75",
	},
	{
		id: "bass",
		name: "Radio Bass",
		location: "Salatiga, Indonesia",
		url: "https://radioonline.co.id/#bass-salatiga",
		logo: "https://cdn.webrad.io/images/logos/radioonline-co-id/bass-salatiga.png",
		stream: "http://live.bassfm.id/;", // Note: HTTP streams might not play on HTTPS sites due to browser security
	},
];

export default function Radio() {
	return (
		<>
			<title>Radio Islamik</title>
			<meta
				name="description"
				content="Dengar stesen radio internet islamik secara langsung"
			/>
			<link rel="icon" href="/favicon.ico" />

			<main className="min-h-screen bg-slate-950 flex flex-col items-center p-4 font-sans pb-20">
				<div className="w-full max-w-5xl space-y-10">
					{/* Header Section */}
					<div className="text-center space-y-3 pt-2">
						<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100">
							Radio <span className="text-acre-600">Islamik</span>
						</h1>
					</div>

					{/* Grid Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{STATIONS.map((station) => (
							<div
								key={station.id}
								className="bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
							>
								{/* Logo Container */}
								<div className="w-24 h-24 mb-6 rounded-full bg-white flex items-center justify-center p-4 border border-slate-800 shadow-inner">
									<img
										src={station.logo}
										alt={station.name}
										className="max-h-full max-w-full object-contain mix-blend-multiply"
									/>
								</div>

								{/* Station Info */}
								<div className="mb-6 space-y-1">
									<h3 className="font-bold text-xl text-slate-100">
										{station.name}
									</h3>
									<p className="text-sm text-slate-400 font-medium uppercase tracking-wider">
										{station.location}
									</p>
								</div>

								{/* Audio Player */}
								{/* We use w-full to make the player stretch to fit the card */}
								<div className="w-full mt-auto">
									{/** biome-ignore lint/a11y/useMediaCaption: no caption for online radio */}
									<audio
										controls
										className="w-full h-10 rounded-full focus:outline-none accent-acre-600"
									>
										<source src={station.stream} />
										Browser anda tidak menyokong elemen audio.
									</audio>
								</div>

								{/* External Link */}
								<a
									href={station.url}
									target="_blank"
									rel="noreferrer"
									className="mt-6 text-xs font-bold text-acre-600 hover:text-acre-800 flex items-center gap-1 transition-colors"
								>
									Lawati Laman Asal
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-3 w-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<title>External Link</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
										/>
									</svg>
								</a>
							</div>
						))}
					</div>
				</div>
			</main>
		</>
	);
}
