# Elevate on an Oracle Always Free VM

This is a **single-VM** deployment of the existing Next.js app. SQLite and private course media stay on a separately mounted block volume; no database or media code migration is required. This guide is a prepared deployment procedure, **not evidence that an Oracle VM has been created or tested**.

## Before you begin: create the Oracle account

Sign up through [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/), verify your email, and finish Oracle's identity and payment-card verification yourself. Choose the **home region** carefully: Always Free compute and block volumes must be created there. You do not need to share your Oracle password, payment details, SSH private key, or one-time codes with anyone working on this repository. After the account is active, continue with the VM and volume steps below. Do not create a resource unless the console marks it **Always Free**; the trial credit can also pay for resources that later become billable.

## 1. Create only Always Free resources

In the Oracle Cloud Console, choose your account's **home region**, an Always Free-eligible Ubuntu 24.04 VM shape, and a 50 GB boot volume. An Ampere A1 VM is a practical choice if capacity is available; the repository requires **Node.js 24** and the app should be built on the VM's own architecture. Create and attach one **new, empty** 100 GB block volume in the same availability domain. The example uses 150 GB total (50 GB boot + 100 GB data), below Oracle's current 200 GB combined Always Free boot/block allowance. Verify the console labels **each** selected resource Always Free before creating it. Capacity and regional availability vary.

Give the VM a public IP and an SSH key. In its network security group or security list, allow TCP 80 and 443 publicly, allow TCP 22 only from your own IP, and **do not** expose TCP 3000. Apply the corresponding host firewall rules as well. Point a DNS name you control to the VM's public IP; the Caddy example uses `lms.example.com`. Keep that IP stable before configuring OAuth callbacks and the site's public origin.

Oracle documentation: [Always Free resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) and [security lists](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/securitylists.htm).

## 2. Mount the data volume

Identify the **new empty block volume** using Oracle's attachment details and `lsblk -f` on the VM. Confirm its device name and serial before formatting; formatting the boot volume or an existing data volume destroys data. Format the new volume as ext4, mount it at `/srv/elevate-data`, and add its **UUID** to `/etc/fstab` so it remounts after reboot. Consult Oracle's attachment instructions for the VM shape; the block-device path is not assumed here.

Before first start and after every reboot, require all three checks:

```bash
findmnt --mountpoint /srv/elevate-data
df -h /srv/elevate-data
test -w /srv/elevate-data
```

Create a dedicated Linux user named `elevate` and grant it ownership of the mounted data directory. Create `/opt/elevate` as a checkout owned by that user. Keep the data volume mounted at `/srv/elevate-data` for the life of the service. The provided systemd unit refuses to start if that path is not a mount point or is not writable. Do not put the database or videos inside the Git checkout.

## 3. Install Node.js and the reverse proxy

Install a supported **Node.js 24** distribution for the VM architecture and verify `node --version`, `npm --version`, and the absolute path from `command -v npm`. The example systemd unit expects `/usr/bin/npm`; edit `ExecStart` if your verified installation uses another path. Install Caddy **2.10 or newer** using its official Ubuntu package instructions. The bundled example uses Caddy's `request_body max_size` directive to permit raw video uploads up to the app's 1 GB limit; Caddy must be recent enough to support it.

References: [Node.js downloads](https://nodejs.org/en/download), [Caddy installation](https://caddyserver.com/docs/install), and [request body limit](https://caddyserver.com/docs/caddyfile/directives/request_body).

## 4. Check out and build Elevate

As the `elevate` user, clone [the repository](https://github.com/blackshadow001/Elevate) into `/opt/elevate` and check out the intended revision. Never copy the Windows `node_modules` directory to Linux. From `/opt/elevate`:

```bash
node --version  # must be 24.x
npm ci
NEXT_PUBLIC_SITE_URL=https://lms.example.com npm run build
```

Replace `lms.example.com` with the actual DNS name. `NEXT_PUBLIC_SITE_URL` must be set **during the build** because Next.js embeds public variables in browser assets. Do not run `npm run db:seed` on the deployment.

## 5. Install private environment and services

Copy [`deploy/oci/elevate.env.example`](../../deploy/oci/elevate.env.example) to `/etc/elevate/elevate.env`, replace the hostname, and protect it with root ownership and mode `0600`. The `DATABASE_URL` and `MEDIA_STORAGE_DIR` values must point to the mounted volume. Keep provider secrets only in this protected file or another secret store; never commit the populated file.

Copy [`deploy/oci/elevate.service.example`](../../deploy/oci/elevate.service.example) to `/etc/systemd/system/elevate.service`. Confirm `WorkingDirectory`, the npm path, user/group, and data mount are correct. Then run `sudo systemctl daemon-reload`, `sudo systemctl enable --now elevate`, and inspect `sudo systemctl status elevate` plus `sudo journalctl -u elevate -n 100 --no-pager`. The existing `npm run start` applies pending SQLite migrations before Next.js listens on port 3000.

Copy [`deploy/oci/Caddyfile.example`](../../deploy/oci/Caddyfile.example) to `/etc/caddy/Caddyfile`, replace the hostname, validate with `sudo caddy validate --config /etc/caddy/Caddyfile`, and reload Caddy. With DNS pointing to the VM and ports 80/443 reachable, Caddy obtains and renews HTTPS certificates. Keep port 3000 blocked externally. If you choose another proxy, it must pass raw video request bodies up to **1,000,000,000 bytes** and allow enough upload time.

## 6. Create the first administrator once

Once migrations have finished, bootstrap the first super admin using `npm run admin:bootstrap` as the `elevate` user, with `DATABASE_URL` and the three `ADMIN_BOOTSTRAP_*` variables set in a **private interactive shell**. Enter the password without putting it in a command line, committed file, or shared shell history; it must have at least 16 characters. Unset the bootstrap variables and exit the shell afterward. The command refuses to overwrite an existing super admin. Public signup creates learner accounts only.

Free VM compute tiers might not provide a provider-managed terminal in your chat. SSH to the VM using your own key; do not send passwords or private keys here.

## 7. Verify before inviting users

```bash
curl --fail --show-error https://lms.example.com/api/health
sudo systemctl status elevate
findmnt --mountpoint /srv/elevate-data
```

The health response must contain `{"status":"ok"}`. In a dedicated test account, register/login, upload a small course thumbnail and video, play it through the authenticated endpoint, then **reboot the VM** and confirm the same account, course, and uploaded files remain. Check logs and available disk space. Google login additionally needs the exact new HTTPS callback URL registered with Google. Paid checkout needs separate verified Razorpay Test Mode setup; do not collect live money solely because the site starts.

Before each code update, take a consistent SQLite and media backup. A safe simple procedure for this single-VM deployment is to stop `elevate`, back up the SQLite database **and** `/srv/elevate-data/media` to a separate location, verify the backup, update/build the checkout, then start the service. Keep an off-VM backup; a second copy on the same disk does not protect against disk loss. Oracle includes a limited number of Always Free volume backups, but verify recovery rather than assuming a snapshot is sufficient. Never format or detach a volume containing live data during an update.

## Limits and handoff

- Oracle's Always Free quotas are account- and region-dependent. A free shape can be unavailable at creation time, and resources outside the allowance can incur charges.
- This remains a **single-instance SQLite application**. The 100 GB sample data volume holds roughly 100 maximum-size 1 GB videos before database space, thumbnails, backups, and filesystem overhead; monitor usage and use smaller test uploads.
- This guide does not move data already stored on a local Windows machine or Render instance. A separate, verified migration is required if existing user records or course files must be retained.
- A public hostname, Oracle account access, the VM's SSH key, and DNS control are required to perform the live deployment. This repository contains no Oracle credentials and cannot provision the VM by itself.

## Repository verification (23 October 2026)

On the Windows development host, `npm run build` completed with Next.js 16.4.1, `npm run test:backend` passed 34/34 against isolated local SQLite files, `npm run lint` returned zero errors (271 pre-existing warnings), and `npm audit --omit=dev --audit-level=critical` found zero vulnerabilities. The first sandboxed backend run could not reach its own loopback server; the same suite passed when rerun with local network access. These checks do **not** verify Oracle VM provisioning, Caddy configuration, disk persistence after reboot, public HTTPS, or a browser workflow on the future deployment.
