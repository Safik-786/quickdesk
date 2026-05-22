# VPN Setup and Troubleshooting

## Connecting to the Company VPN

We use **Cisco AnyConnect** for remote access. Download it from the IT portal at `it.company.internal/vpn`.

**Steps to connect:**
1. Open Cisco AnyConnect.
2. Enter the server address: `vpn.company.com`.
3. Use your company email and network password to log in.
4. Accept the MFA prompt on your phone (Microsoft Authenticator).

## Common Issues

**"Authentication failed"** — Your network password may have expired. Reset it at `password.company.internal` or contact IT.

**"Unable to connect to server"** — Check your internet connection first. If on a home network, try restarting your router. Corporate firewalls on some hotel/café networks can block VPN traffic; try a mobile hotspot.

**"VPN connects but I can't reach internal sites"** — Try disconnecting and reconnecting. If the issue persists, run `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac).

**Split tunneling** is disabled by policy — all traffic routes through the VPN when connected.

## Need Help?

If none of the above resolves your issue, submit a ticket with your OS version, AnyConnect version, and the exact error message. IT will respond within 4 business hours.
