# Elevate on AWS Free plan (temporary deployment)

This is a **single-EC2-instance** deployment of Elevate. The existing SQLite database and private course media live on an attached Amazon EBS volume, so no database or media-code migration is required. This is a prepared procedure, **not evidence that an AWS account, EC2 instance, or live site exists**.

## 1. Account and credit limits

Create an account from [AWS Free Tier](https://aws.amazon.com/free/) and select the **Free plan**. AWS says most new customers can sign up without a card, but it can still request one for identity verification. Complete sign-in and any personal or payment verification yourself; do not share credentials or codes with the repository maintainers.

The new-account Free plan starts with $100 in credits and may offer more, up to $200 total. It ends after **six months or when credits run out**, whichever happens first. EC2, EBS, and a public IPv4 address consume credits; they are not an indefinitely free hosting arrangement. Monitor the Cost and Usage widget and set billing alerts. Before expiry, export and verify a complete off-AWS backup or choose a paid plan. Do not assume the instance will remain available after the Free plan ends. See [AWS Free Tier](https://aws.amazon.com/free/), [EC2 eligibility](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html), and [public IPv4 pricing](https://aws.amazon.com/vpc/pricing/).

## 2. Create the instance and durable volume

In the EC2 Console, select one region and an Ubuntu 24.04 image marked eligible for the Free plan. For a source build of this Next.js project, prefer a **4 GiB RAM** eligible shape such as `c7i-flex.large` if it is available and its displayed credit usage fits your budget. A smaller instance may need additional build memory; do not treat a successful build on another machine as proof that it will build on the chosen VM. Check the current shape's eligibility and estimate in the Console before launch. Use an on-demand instance, not Spot, for the single SQLite host. Enable EBS encryption.

Create and attach one **new, empty** `gp3` data volume in the same Availability Zone. Size it for the test period and expected course videos; a 1 GB upload limit is **per video**, not a storage allocation. The volume and boot disk both consume credits. The dedicated data volume makes backups and moving the data to a replacement instance easier, but it must not be deleted when replacing the VM. Record its volume ID and backup plan. AWS documents [attaching EBS volumes](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-attaching-volume.html).

Assign a public IP so the instance can serve the site. In its security group, allow TCP 80 and 443 from the internet and TCP 22 only from your current public IP. Do **not** open TCP 3000. Keep the SSH private key with you. Public IPv4 consumes credits even when the VM is running; choose a stable address before configuring a domain and OAuth callbacks. See [AWS security group guidance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/creating-security-group.html).

## 3. Mount the EBS volume

SSH to the instance. Use the EBS attachment details, volume ID, and `lsblk -f` to identify the **new empty data volume**. Confirm the device before formatting; formatting the boot disk or an existing data volume destroys data. Format the new volume as ext4, mount it at `/srv/elevate-data`, and add its filesystem **UUID** to `/etc/fstab` so it mounts after reboot. Device names can differ between the EC2 Console and Linux, so do not assume a path from an example. Use [AWS's EBS mount instructions](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-using-volumes.html) for the selected instance.

Check the mount before starting Elevate and after every reboot:

```bash
findmnt --mountpoint /srv/elevate-data
df -h /srv/elevate-data
test -w /srv/elevate-data
```

Create a dedicated `elevate` Linux user and give it ownership of the mounted data directory and `/opt/elevate` checkout. The supplied systemd unit refuses to start unless `/srv/elevate-data` is mounted and writable, preventing a missing EBS attachment from silently moving data onto the boot disk.

## 4. Install and configure the app

Follow the shared Linux application steps in [Oracle guide sections 3–7](ORACLE_ALWAYS_FREE.md#3-install-nodejs-and-the-reverse-proxy): install Node.js 24 and Caddy 2.10+, clone the repository, run `npm ci` and the production build, and install the provided systemd, environment, and Caddy templates from [`deploy/oci`](../../deploy/oci). Those three templates contain no Oracle API calls and also work on EC2 with the same `/srv/elevate-data` mount. Replace `lms.example.com` with a DNS name pointing to the instance. Set `NEXT_PUBLIC_SITE_URL` **during build** and in the protected runtime environment. Keep the SQLite file and uploads on the EBS mount.

`npm run start` applies pending SQLite migrations before the server listens. Bootstrap the first administrator once using private `ADMIN_BOOTSTRAP_*` values. Do not run the development seed on a live instance. Keep the database, media directory, and environment file out of Git.

## 5. Verify and plan exit

Check HTTPS `/api/health`, sign-in, a small real video upload, authenticated playback, and persistence after an EC2 reboot. Verify the EBS mount and application service after reboot. Configure Google OAuth for the final HTTPS origin if needed. Payment remains a separate provider setup and must be tested in Razorpay Test Mode before any live checkout.

Before inviting learners, make and **restore-test** an off-instance backup of both SQLite and the media directory. A snapshot of the EBS volume can help, but it still consumes AWS resources and should not be your only exit plan. The Free plan is temporary: before credits expire, decide whether to upgrade to paid AWS hosting or move the database and media to another persistent host. This repository does not perform that migration automatically.

## Current status

The AWS signup form has been opened for the account owner. No account, EC2 instance, EBS volume, DNS record, live HTTPS endpoint, or AWS browser acceptance test has been verified as of 24 October 2026. The repository's previous local verification is recorded in the [Oracle guide](ORACLE_ALWAYS_FREE.md#repository-verification-23-october-2026); it is not a live AWS test.
