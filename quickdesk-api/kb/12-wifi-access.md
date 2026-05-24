# Corporate Wi-Fi Network Access

## 1. Overview
The corporate wireless network is segmented into three distinct SSIDs to ensure security, bandwidth management, and isolation of guest traffic.

## 2. Wireless Networks
- **Corp-Secure**: This is the primary network for all company-issued laptops. It uses 802.1X certificate-based authentication. Your corporate device should connect to this network automatically. No password is required.
- **Corp-Mobile**: Intended for employee-owned mobile devices (smartphones, personal tablets). Connect using your Active Directory username and password. You will be prompted to accept a security certificate upon first connection.
- **Corp-Guest**: A heavily restricted, internet-only network for visitors, clients, and contractors. This network features client isolation and blocks access to all internal corporate resources.

## 3. Connecting to Corp-Mobile
1. On your mobile device, select the **Corp-Mobile** Wi-Fi network.
2. When prompted for EAP Method, select **PEAP**.
3. For Phase 2 authentication, select **MSCHAPv2**.
4. Enter your standard AD username (e.g., `jsmith`) and password. Leave "Anonymous Identity" blank.
5. If prompted to trust the certificate from `radius.enterprise.com`, click **Trust** or **Connect**.

## 4. Guest Access Provisioning
Employees can generate 24-hour guest Wi-Fi passes for visitors.
1. Navigate to the IT Portal and select **Guest Wi-Fi Provisioning**.
2. Enter the visitor's name and email address.
3. An email containing the daily PSK (Pre-Shared Key) will be sent to the visitor.

## 5. Troubleshooting
If your corporate laptop fails to connect to `Corp-Secure`:
- Ensure your device's date and time are synchronized. A time skew of more than 5 minutes will invalidate the security certificate.
- Submit an IT ticket from a wired connection or hot-spot so the Helpdesk can push a new 802.1X certificate via the MDM.
