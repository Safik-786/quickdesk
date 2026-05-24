# Corporate Email and Communication Policy

## 1. Overview
The company utilizes Microsoft Exchange Online (Microsoft 365) for all corporate email, calendaring, and contacts. Access to corporate email is restricted to approved email clients and devices enrolled in Mobile Device Management (MDM).

## 2. Approved Email Clients
- **Windows/macOS**: Microsoft Outlook desktop client, Outlook on the Web (OWA) via approved web browsers.
- **iOS/Android**: Microsoft Outlook mobile app. (The native Mail apps on iOS and Android are blocked by conditional access policies to prevent data leakage).

## 3. Mobile Device Setup
To access email on your smartphone:
1. Download the **Microsoft Outlook** app from the App Store or Google Play Store.
2. Enter your corporate email address (`firstname.lastname@enterprise.com`).
3. You will be redirected to the Okta login page. Enter your credentials and approve the MFA prompt.
4. The Intune Company Portal will prompt you to register the device. Accept the prompt to apply the security profile.
5. Your email, calendar, and contacts will begin syncing.

## 4. Email Security and Phishing
- All external emails are marked with a yellow **[EXTERNAL]** banner. Exercise caution when clicking links or opening attachments from these senders.
- Do not forward corporate emails to personal email accounts (e.g., Gmail, Yahoo). This is a violation of the Data Loss Prevention (DLP) policy.
- If you receive a suspicious email (phishing attempt, unexpected invoice, CEO gift card scam), click the **Report Phish** button in the Outlook ribbon. Do NOT forward the email to IT.

## 5. Troubleshooting
**Q: My mailbox is full.**
A: All employees have a 50GB mailbox quota. You must delete old emails or utilize the Online Archive feature. Emptying the "Deleted Items" folder is a good first step.

**Q: I am not receiving emails from a specific vendor.**
A: Check your Junk Email folder. If the email is not there, submit an IT ticket with the sender's exact email address and the approximate time they sent the message so we can trace it in the Exchange admin center.
