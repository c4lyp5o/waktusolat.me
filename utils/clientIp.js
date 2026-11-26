// clientIp.js — resolve the real client IP once, in the node:http bridge
// (server.js), and hand it to Elysia as CLIENT_IP_HEADER. The bridge always
// overwrites that header, so downstream code can trust it.
//
// Production runs behind Traefik, which appends the address of whoever
// connected to it as the LAST X-Forwarded-For entry; earlier entries are
// client-supplied and never trusted. XFF is only honoured when the TCP peer
// is itself private/loopback (Traefik on the docker network) — a direct
// public hit on the container port falls back to the socket address.

export const CLIENT_IP_HEADER = "x-client-ip";

const PRIVATE_RANGES = [
	/^127\./,
	/^10\./,
	/^192\.168\./,
	/^172\.(1[6-9]|2\d|3[01])\./,
	/^::1$/,
	/^f[cd][0-9a-f]{2}:/i, // fc00::/7 unique-local
	/^fe80:/i, // link-local
];

const normalize = (ip) =>
	String(ip ?? "")
		.trim()
		.replace(/^::ffff:/i, "");

export const isPrivateIp = (ip) => PRIVATE_RANGES.some((re) => re.test(normalize(ip)));

export function resolveClientIp(peer, forwardedFor) {
	const socketIp = normalize(peer);
	if (forwardedFor && isPrivateIp(socketIp)) {
		const last = String(forwardedFor)
			.split(",")
			.map((hop) => hop.trim())
			.filter(Boolean)
			.at(-1);
		if (last) return normalize(last);
	}
	return socketIp || "unknown";
}
