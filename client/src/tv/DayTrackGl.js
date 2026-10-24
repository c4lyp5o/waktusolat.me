// DayTrackGl.js — the day track's sky in WebGL (three.js), lazy-loaded.
//
// Draws only atmosphere, from lib/daytrack.js geometry: the arc, soft light
// around the sun, the horizon glow at dawn and dusk, and slowly twinkling
// stars at night. The sun disc, labels and now marker stay HTML, so data
// looks identical whichever renderer is used.
//
// Budget for weak TV GPUs (spec: Motion and three.js budget):
//   day        render on change only (the sun moves a few px a minute)
//   night/dawn animate the stars, capped at 15 fps
//   any frame  slower than 50 ms on average over 5 s -> onSlow() -> SVG
import {
	AdditiveBlending,
	BufferGeometry,
	Float32BufferAttribute,
	Mesh,
	MeshBasicMaterial,
	OrthographicCamera,
	PlaneGeometry,
	Points,
	Scene,
	ShaderMaterial,
	SRGBColorSpace,
	WebGLRenderer,
} from "three";
import { ARC_TOP, STARS } from "../lib/waktu/daytrack.js";

const AMBER = [0.949, 0.702, 0.239]; // #f2b33d
const STAR_FPS = 15;
const SLOW_FRAME_MS = 50;
const PROBE_WINDOW_MS = 5000;

// A CSS colour token (the theme's --arc, --sun) as rgb 0..1 and alpha:
// #rrggbb or rgb(r g b / a), as the theme files write them.
export function cssColor(value) {
	const v = String(value).trim();
	const hex = v.match(/^#([0-9a-f]{6})$/i);
	if (hex) {
		const n = Number.parseInt(hex[1], 16);
		return { rgb: [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255], a: 1 };
	}
	const rgb = v.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:\s*[/,]\s*([\d.]+))?\s*\)$/);
	if (rgb) {
		return {
			rgb: [rgb[1] / 255, rgb[2] / 255, rgb[3] / 255],
			a: rgb[4] === undefined ? 1 : +rgb[4],
		};
	}
	return null;
}

// A soft radial light: alpha falls from `strength` at the centre to 0.
function glowMaterial(strength) {
	return new ShaderMaterial({
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending,
		uniforms: { strength: { value: strength }, color: { value: [...AMBER] } },
		vertexShader:
			"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
		fragmentShader: `
			uniform float strength; uniform vec3 color; varying vec2 vUv;
			void main() {
				float d = distance(vUv, vec2(0.5));
				float a = strength * smoothstep(0.5, 0.0, d);
				gl_FragColor = vec4(color * a, a);
			}`,
	});
}

// Stars at the shared positions (lib/waktu/daytrack.js STARS), so the GL
// sky and the SVG fallback show the same sky.
function starField(aspect) {
	const positions = [];
	const phases = [];
	STARS.forEach((star, i) => {
		positions.push(star.x * aspect, 1 - star.y, 0);
		phases.push((i * 2.399) % 6.283);
	});
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
	geometry.setAttribute("phase", new Float32BufferAttribute(phases, 1));
	const material = new ShaderMaterial({
		transparent: true,
		depthWrite: false,
		uniforms: { time: { value: 0 }, size: { value: 2 } },
		vertexShader: `
			attribute float phase; uniform float time; uniform float size; varying float vAlpha;
			void main() {
				vAlpha = 0.35 + 0.25 * sin(time * 0.6 + phase);
				gl_PointSize = size;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}`,
		fragmentShader: `
			varying float vAlpha;
			void main() {
				if (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;
				gl_FragColor = vec4(vec3(0.58), vAlpha);
			}`,
	});
	return new Points(geometry, material);
}

// Triangles for a ribbon along the Syuruk -> Maghrib arc, 3 px wide.
function arcRibbon(a, aspect, heightPx) {
	const half = 1.5 / Math.max(heightPx, 1); // 1 unit = the sky's height
	const pts = [];
	for (let i = 0; i <= 64; i++) {
		const f = i / 64;
		pts.push([(a.from + (a.to - a.from) * f) * aspect, ARC_TOP * Math.sin(Math.PI * f)]);
	}
	const out = [];
	for (let i = 0; i < pts.length - 1; i++) {
		const [x0, y0] = pts[i];
		const [x1, y1] = pts[i + 1];
		const len = Math.hypot(x1 - x0, y1 - y0) || 1;
		const nx = (-(y1 - y0) / len) * half;
		const ny = ((x1 - x0) / len) * half;
		out.push(x0 - nx, y0 - ny, 0, x1 - nx, y1 - ny, 0, x1 + nx, y1 + ny, 0);
		out.push(x0 - nx, y0 - ny, 0, x1 + nx, y1 + ny, 0, x0 + nx, y0 + ny, 0);
	}
	return out;
}

export function createSkyRenderer(canvas, { onSlow }) {
	const renderer = new WebGLRenderer({
		canvas,
		antialias: true,
		alpha: true,
		powerPreference: "low-power",
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	const scene = new Scene();
	// x runs 0..aspect, y 0..1 (bottom up), so circles stay round.
	const camera = new OrthographicCamera(0, 1, 1, 0, -1, 1);
	let aspect = 1;
	let track = null;
	let arcKey = "";

	const sunLight = new Mesh(new PlaneGeometry(1, 1), glowMaterial(0.28));
	const horizon = new Mesh(new PlaneGeometry(1, 1), glowMaterial(0.22));
	// WebGL ignores line width, so the arc is a thin triangle ribbon (3 px,
	// matching the SVG fallback's stroke).
	const arc = new Mesh(
		new BufferGeometry(),
		new MeshBasicMaterial({ color: 0x444444, transparent: true }),
	);
	let stars = starField(1);
	scene.add(arc, horizon, sunLight, stars);

	function layout() {
		const { clientWidth: w, clientHeight: h } = canvas;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		aspect = w / h;
		camera.right = aspect;
		camera.updateProjectionMatrix();
		scene.remove(stars);
		stars.geometry.dispose();
		stars = starField(aspect);
		stars.material.uniforms.size.value = Math.max(2, h * 0.025) * renderer.getPixelRatio();
		scene.add(stars);
	}

	function place() {
		if (!track) return;
		const { arc: a, sun, phase } = track;
		// The arc changes only with the day or the canvas, not every second.
		const key = `${a.from}:${a.to}:${aspect}:${canvas.clientHeight}`;
		if (key !== arcKey) {
			arcKey = key;
			arc.geometry.setAttribute(
				"position",
				new Float32BufferAttribute(arcRibbon(a, aspect, canvas.clientHeight), 3),
			);
		}

		sunLight.visible = Boolean(sun);
		if (sun) {
			sunLight.position.set(sun.x * aspect, sun.lift * ARC_TOP, 0);
			sunLight.scale.set(1.6, 1.6, 1);
		}
		horizon.visible = phase === "dawn" || phase === "dusk";
		if (horizon.visible) {
			horizon.position.set((phase === "dawn" ? a.from : a.to) * aspect, 0, 0);
			horizon.scale.set(3, 1.8, 1);
		}
		stars.visible = phase === "night" || phase === "dawn";
	}

	// Frame-time probe: a TV that cannot keep up goes back to the SVG.
	let probeStart = performance.now();
	let probeTotal = 0;
	let probeFrames = 0;
	let slow = false;
	function render() {
		const t0 = performance.now();
		renderer.render(scene, camera);
		const t1 = performance.now();
		probeTotal += t1 - t0;
		probeFrames += 1;
		if (t1 - probeStart >= PROBE_WINDOW_MS) {
			if (!slow && probeTotal / probeFrames > SLOW_FRAME_MS) {
				slow = true;
				onSlow("frame time");
			}
			probeStart = t1;
			probeTotal = 0;
			probeFrames = 0;
		}
	}

	let raf = 0;
	let lastFrame = 0;
	function loop(t) {
		raf = requestAnimationFrame(loop);
		if (document.hidden || !stars.visible || t - lastFrame < 1000 / STAR_FPS) return;
		lastFrame = t;
		stars.material.uniforms.time.value = t / 1000;
		render();
	}

	const resize = new ResizeObserver(() => {
		layout();
		place();
		render();
	});
	resize.observe(canvas);
	canvas.addEventListener("webglcontextlost", (e) => {
		e.preventDefault();
		onSlow("context lost");
	});
	layout();
	raf = requestAnimationFrame(loop);

	return {
		update(next) {
			track = next;
			place();
			render();
		},
		// The theme's colours (TV themes, Langit's skies). Unreadable tokens
		// keep the last good colour.
		setColors({ arc: arcCss, glow: glowCss }) {
			const a = cssColor(arcCss);
			if (a) {
				arc.material.color.setRGB(...a.rgb, SRGBColorSpace);
				arc.material.opacity = a.a;
			}
			const g = cssColor(glowCss);
			if (g) {
				for (const m of [sunLight.material, horizon.material]) m.uniforms.color.value = g.rgb;
			}
			// Not before the first update: drawing the arc before its geometry
			// exists leaves three.js with an empty mesh for good.
			if (track) render();
		},
		dispose() {
			cancelAnimationFrame(raf);
			resize.disconnect();
			renderer.dispose();
		},
	};
}
