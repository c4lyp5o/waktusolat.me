// ProgrammeCard.jsx — one of the mosque's programmes in the banner slot:
// the ustaz's photo full height on the left, then when (amber: next), the
// title and the speaker. Nothing under 3.2vh; long titles are clipped,
// never shrunk.
export default function ProgrammeCard({ item }) {
	return (
		<div className={`tv-prog${item.photo ? " has-photo" : ""}`}>
			{item.photo && <img className="tv-prog-photo" src={item.photo} alt="" />}
			<div className="tv-prog-text">
				<p className="tv-prog-when">{item.when}</p>
				<p className={`tv-prog-title${item.speaker ? "" : " two-lines"}`}>{item.title}</p>
				{item.speaker && <p className="tv-prog-speaker">{item.speaker}</p>}
			</div>
		</div>
	);
}
