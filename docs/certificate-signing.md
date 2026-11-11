# Digitally signed course certificates

The learner's **Download signed PDF** button calls the authenticated certificate download route. The server reads the issued certificate record, rejects revoked records, creates a personalized PDF, and adds a detached PDF signature using Elevate's PKCS#12 document-signing credential. It never exports an unsigned PDF when signing is unavailable.

## Production setup

1. Obtain an organization-owned **PDF document-signing** certificate from a trusted certificate authority. Confirm before purchase that its private key may be exported as a password-protected `.p12` or `.pfx` file and used for unattended server signing. Some providers issue only hardware-token or cloud-only credentials, which require a different integration. A self-signed certificate proves that a PDF has not changed, but PDF readers will not automatically trust Elevate as the signer.
2. Place it outside the repository and web root, for example `/etc/elevate/certificate-signing.p12`. Set the file owner to the `elevate` service account and mode to `0400`.
3. In the private `/etc/elevate/elevate.env` systemd environment file, configure:

   ```text
   CERTIFICATE_SIGNING_P12_PATH=/etc/elevate/certificate-signing.p12
   CERTIFICATE_SIGNING_P12_PASSWORD=the-private-p12-password
   ```

   Keep that file owned by root with mode `0600`. Do not put the credential or password in Git, a client-side environment variable, or a support message.
4. Restart `elevate.service`. Sign in as a learner who has completed a course, download the PDF, and inspect its **Signatures** panel in a PDF reader. Confirm the signature is valid, the signer identity is Elevate, the trust chain is recognized, and the PDF has not been modified.

The certificate's verification URL checks the live issuance status. A previously downloaded PDF keeps its cryptographic signature even if an administrator later revokes the certificate; the verification page then reports it invalid.
