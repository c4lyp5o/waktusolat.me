// surface.js — which screen a TV URL is being shown on.
// A tall viewport is a portrait panel; everything else is the landscape
// screen (a square panel stays landscape). Pure, so it is tested without a
// browser; the phone is included on purpose: a phone holding /tv/ upright is
// exactly the panel shape a lobby mounts.
export function surfaceOf(width, height) {
	if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
		return "tv";
	}
	return height > width ? "tvPotret" : "tv";
}
