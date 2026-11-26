# Security Policy

## Supported Versions

Only the latest release (the `main` branch, deployed to waktusolat.me) receives security fixes.

| Version | Supported          |
| ------- | ------------------ |
| 2.1.x   | :white_check_mark: |
| < 2.1   | :x:                |

## Reporting a Vulnerability

Please report vulnerabilities privately through GitHub: open the repository's **Security** tab and choose **Report a vulnerability**. Don't open a public issue for security problems.

Include the affected endpoint or file, steps to reproduce, and the impact you observed.

## Deployment Hardening Notes

- **Admin routes** (`GET /api/v1/visitors`, `POST /api/v1/cache/invalidate`) require `x-api-key: <ADMIN_API_KEY>`. They fail closed: with `ADMIN_API_KEY` unset or empty, they always return `401`.
- **Keep secrets out of the image.** Provide `ADMIN_API_KEY` through the runtime environment on the server, not through a `.env` in the Docker build context.
- **Client IP and the proxy.** The app trusts `X-Forwarded-For` only when the TCP peer is a private/loopback address (the reverse proxy), and then uses only the last hop. Don't expose the container port publicly; route all traffic through the proxy.
- **Visitor data.** The visitor DB stores client IPs. Keep it on a volume (`/app/storage`), not in the image.
