# Enterprise VPN Setup and Troubleshooting Policy

## 1. Overview
This document outlines the standard operating procedure for installing, configuring, and troubleshooting the GlobalProtect Enterprise Virtual Private Network (VPN) client. The VPN is required for accessing internal corporate resources, staging environments, and the intranet when working off-site.

## 2. Prerequisites
- Active Directory (AD) credentials.
- Multi-Factor Authentication (MFA) enrolled via Okta Verify or Duo Security.
- Company-issued device (Windows 11 or macOS 13+). BYOD devices require special MDM enrollment.

## 3. Installation Steps
1. Navigate to the self-service portal at `https://myapps.enterprise.internal`.
2. Select **IT Resources** > **GlobalProtect VPN Client**.
3. Download the appropriate installer for your Operating System.
4. Run the installer with elevated privileges (Administrator).
5. Restart your machine once the installation is complete.

## 4. Configuration and Connection
1. Open the GlobalProtect client from the system tray or menu bar.
2. Enter the gateway address: `vpn-gateway.enterprise.com`.
3. Click **Connect**. You will be prompted for your AD credentials.
4. Approve the push notification on your MFA mobile device.
5. Upon successful connection, the icon will display a green shield.

## 5. Troubleshooting & FAQs
**Q: I receive an "Authentication Failed" error.**
A: Ensure your AD password has not expired. If it has, reset it via the Okta portal. Also, ensure you are approving the MFA prompt within 30 seconds.

**Q: "Gateway Unreachable" error.**
A: Check your local internet connection. Certain public Wi-Fi networks (e.g., hotels, cafes) block UDP port 4501. Try switching to a mobile hotspot.

**Q: I am connected but cannot access internal sites.**
A: Flush your DNS cache (`ipconfig /flushdns` on Windows or `sudo killall -HUP mDNSResponder` on macOS).

## 6. Escalation
If issues persist after following the troubleshooting steps, please submit a Level 2 Network Support ticket with the subject "VPN Access Failure" and include your IP address, OS version, and exact error code.
