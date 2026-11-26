// photo.js — the ustaz's photo, made small in the browser before upload: a
// centred square (a portrait's face is usually centred), 600x600 JPEG. The
// server accepts at most 200 KB and strips metadata either way; re-drawing
// through a canvas drops EXIF and GPS before anything leaves the phone.
export const PHOTO_SIDE = 600;
const MAX_BYTES = 200 * 1024;

// The largest centred square of a w x h image.
export function cropSquare(width, height) {
	const side = Math.min(width, height);
	return { sx: Math.floor((width - side) / 2), sy: Math.floor((height - side) / 2), side };
}

async function decode(file) {
	if (typeof createImageBitmap === "function") {
		try {
			// Applies the photo's EXIF rotation, so a phone portrait stays upright.
			return await createImageBitmap(file, { imageOrientation: "from-image" });
		} catch {
			// Fall through to <img>.
		}
	}
	const url = URL.createObjectURL(file);
	try {
		const img = new Image();
		img.src = url;
		await img.decode();
		return img;
	} finally {
		URL.revokeObjectURL(url);
	}
}

// File -> JPEG Blob of PHOTO_SIDE square, under MAX_BYTES. Throws when the
// file is not an image the browser can read.
export async function squareJpeg(file) {
	const image = await decode(file);
	const { sx, sy, side } = cropSquare(image.width, image.height);
	const out = Math.min(PHOTO_SIDE, side);
	const canvas = document.createElement("canvas");
	canvas.width = out;
	canvas.height = out;
	const g = canvas.getContext("2d");
	g.imageSmoothingQuality = "high";
	g.drawImage(image, sx, sy, side, side, 0, 0, out, out);
	image.close?.();
	for (const quality of [0.85, 0.75, 0.6, 0.45]) {
		const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
		if (blob && blob.size <= MAX_BYTES) return blob;
	}
	throw new Error("photo too large");
}
