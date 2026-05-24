# Corporate Password Reset and Credential Management

## 1. Policy Overview
To maintain compliance with ISO 27001 standards, all corporate Active Directory (AD) and Okta passwords must be changed every 90 days. Passwords cannot be reused within a 12-month period.

## 2. Password Requirements
Your new password must meet the following complexity criteria:
- Minimum of 14 characters in length.
- Must contain at least one uppercase letter (A-Z).
- Must contain at least one lowercase letter (a-z).
- Must contain at least one numeric character (0-9).
- Must contain at least one special character (!@#$%^&*).
- Cannot contain your first name, last name, or username.

## 3. Self-Service Password Reset (SSPR)
If you remember your current password but it is expiring:
1. Log in to the Okta Dashboard at `https://login.enterprise.com`.
2. Click on your profile picture in the top right > **Settings**.
3. Under the **Security** tab, click **Change Password**.
4. Enter your current password and the new compliant password twice.
5. You will need to re-authenticate on your mobile devices and VPN.

## 4. Forgotten Password Recovery
If you have forgotten your password or are locked out:
1. Go to `https://login.enterprise.com` and click **Forgot Password**.
2. Enter your corporate email address.
3. Select an alternate verification method (SMS, Voice Call, or Personal Email).
4. Enter the 6-digit recovery code.
5. Create a new password adhering to the complexity requirements.

## 5. Account Lockouts
After 5 failed login attempts, your account will be temporarily locked for 30 minutes. The IT Helpdesk cannot bypass this 30-minute lockout timer. Please wait and try again.

## 6. Escalation
If you are unable to use the Self-Service Password Reset tool (e.g., lost your MFA device), you must call the Global IT Service Desk at 1-800-555-0199. For security verification, you will be asked to provide your Employee ID and answer your security questions.
