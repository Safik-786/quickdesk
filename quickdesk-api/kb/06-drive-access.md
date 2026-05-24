# Network Share and Cloud Drive Access

## 1. Overview
This policy outlines the procedure for requesting and maintaining access to secure internal network shares, Google Drive Shared Drives, and SharePoint document libraries. Access is governed by the Principle of Least Privilege.

## 2. Shared Drive Structure
- **Global Read-Only**: Standard company-wide policies and announcements.
- **Departmental Shares**: Restricted to members of specific departments (e.g., Finance, HR, Engineering).
- **Project-Specific Folders**: Temporary shares granted only for the duration of a specific project.

## 3. Access Request Procedure
To request access to a restricted drive or folder:
1. Identify the exact path or URL of the resource.
2. Submit a ticket via the IT Support Portal categorized under **Access Request > Network Drives**.
3. Include a detailed business justification and the required access level (Read-Only or Read/Write).
4. The ticket will automatically route to the Data Owner (usually a Department Head or Project Manager) for approval. IT cannot grant access without Data Owner approval.

## 4. Periodic Access Reviews
In accordance with SOC2 compliance, all folder permissions are audited quarterly. Data Owners must review the access control lists and revoke access for users who no longer require it.

## 5. Troubleshooting
**Q: I was granted access but get an "Access Denied" error in Windows Explorer.**
A: Network drive permissions sync every 4 hours. You can force a sync by locking your computer, waiting 60 seconds, and unlocking it, or by rebooting.

**Q: I accidentally deleted a file on the shared drive.**
A: Do not panic. We maintain daily snapshots with a 30-day retention period. Submit an urgent IT ticket with the exact filename, folder path, and approximate time of deletion to request a restoration.
