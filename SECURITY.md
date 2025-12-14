# Security Policy

## Supported Versions

Generally, only the latest version of this project is currently supported.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability within this project, please follow these steps:

1.  **Do not create a public GitHub issue.** This allows us to address the vulnerability before it can be exploited.
2.  Email our security team at `suryanshunab@gmail.com` (or the repository owner).
3.  Include a detailed description of the vulnerability, steps to reproduce, and any potential impact.

We will acknowledge your report within 48 hours and work to resolve the issue as quickly as possible.

## Security Best Practices for Deployment

When deploying this application to production, please ensure:

- **Database Security:** Use strong, unique passwords for your database and ensure it is not publicly accessible.
- **Environment Variables:** Never commit `.env` files to version control. Use a secret manager.
- **Authentication:** Ensure `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` are kept secure.
- **SSL/TLS:** Always serve the application over HTTPS.

## License

This project is protected under the MIT License. See the [LICENSE](LICENSE) file for details.
