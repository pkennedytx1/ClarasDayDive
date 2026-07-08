# Custom domain — GoDaddy DNS (Option B)

Production site: **https://www.clarasdaydive.com** (canonical)

Apex `clarasdaydive.com` forwards to `www` via GoDaddy domain forwarding.

**GoDaddy keeps DNS** — email, MX, and other records stay in the GoDaddy panel. SST uses a manual ACM certificate and CloudFront; you add DNS records in GoDaddy after deploy.

GitHub Actions deploys with `SST_STAGE=production` and `ACM_CERT_ARN`.

---

## Overview

```
GoDaddy DNS (unchanged nameservers)
    ├── CNAME  _acm-validation…     ← prove domain ownership (Step 1)
    ├── CNAME  www                  → CloudFront (Step 3, after deploy)
    ├── Forwarding  @               → https://www.clarasdaydive.com (Step 3)
    └── MX / TXT / etc.             ← client adds email later, no conflict
```

---

## Step 1 — ACM certificate (SSL)

Certificate must live in **us-east-1** (CloudFront requirement).

### Already requested via CLI

| | Value |
|---|---|
| **Certificate ARN** | `arn:aws:acm:us-east-1:622885995693:certificate/6af1e80c-9969-4d51-b994-3cc9e8c3cd40` |
| **GitHub Secret/Variable** | `ACM_CERT_ARN` = ARN above |

### Add validation records in GoDaddy

**GoDaddy → clarasdaydive.com → DNS → Add**

For **each** validation record below, create a **CNAME**:

| Type | Name (GoDaddy) | Value | TTL |
|------|----------------|-------|-----|
| CNAME | `_` + hash from table below | `_` + hash from ACM `.acm-validations.aws` | 1 Hour |

Run this locally to print current validation records (names may rotate if cert is re-requested):

```bash
aws acm describe-certificate \
  --certificate-arn "arn:aws:acm:us-east-1:622885995693:certificate/6af1e80c-9969-4d51-b994-3cc9e8c3cd40" \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[*].ResourceRecord' \
  --output table
```

**GoDaddy name field:** paste only the part **before** `.clarasdaydive.com` (GoDaddy adds the domain suffix).

Example — if ACM says name is `_abc123.clarasdaydive.com`, enter **`_abc123`** in GoDaddy.

Wait until status is **Issued**:

```bash
aws acm describe-certificate \
  --certificate-arn "arn:aws:acm:us-east-1:622885995693:certificate/6af1e80c-9969-4d51-b994-3cc9e8c3cd40" \
  --region us-east-1 \
  --query 'Certificate.Status' \
  --output text
```

Usually **5–30 minutes** after CNAME records propagate.

---

## Step 2 — GitHub secret

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|--------|
| `ACM_CERT_ARN` | `arn:aws:acm:us-east-1:622885995693:certificate/6af1e80c-9969-4d51-b994-3cc9e8c3cd40` |

Do **not** change GoDaddy nameservers.

---

## Step 3 — Deploy from GitHub Actions

1. Confirm ACM status is **Issued** (Step 1).
2. **Actions → Publish site → Run workflow**.
3. First custom-domain deploy may take **10–20 minutes**.
4. In the workflow log, note SST output:
   - `url: https://clarasdaydive.com`
   - CloudFront distribution domain (e.g. `dxxxxxxxx.cloudfront.net`) if shown

---

## Step 4 — Point GoDaddy DNS at CloudFront

After a successful deploy:

### `www` subdomain

**DNS → Add → CNAME**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `www` | CloudFront domain from deploy log (e.g. `d19sxc1xcbgypp.cloudfront.net`) | 1 Hour |

### Apex `@` (root domain)

GoDaddy does not support CNAME on `@`. Use **domain forwarding**:

**GoDaddy → clarasdaydive.com → Forwarding** (or **Forwarding and Masking**)

| Field | Value |
|-------|--------|
| Forward **clarasdaydive.com** to | `https://www.clarasdaydive.com` |
| Type | **Permanent (301)** |
| Forward only | **Forward only** (not masking) |

SST serves the site on `www` (no www → apex redirect in SST — that would loop with GoDaddy forwarding).

**Live setup:**

- **CNAME `www` → CloudFront**
- **Forward `@` → `https://www.clarasdaydive.com`**
- **`seo_site_url` = `https://www.clarasdaydive.com`**

---

## Step 5 — Sheet SEO URL

Set `_Settings` → `seo_site_url` to `https://www.clarasdaydive.com` and publish once.

---

## Step 6 — Google Search Console (HTML tag)

Use the **HTML tag** method — **not** the GoDaddy / domain-name-provider option (that is DNS verification).

1. [Google Search Console](https://search.google.com/search-console) → **Add property** → **URL prefix** → `https://www.clarasdaydive.com`
2. Choose verification method **HTML tag**
3. Copy only the `content` value from the meta tag Google shows, e.g. if the tag is:
   ```html
   <meta name="google-site-verification" content="AbCdEf123..." />
   ```
   copy just `AbCdEf123...`
4. In the Google Sheet `_Settings` tab, set:
   - `google_site_verification` = that content value (no quotes)
5. **Publish site** from the sheet (injects the meta tag into `index.html` on deploy)
6. Back in Search Console, click **Verify** — ignore any prompt to confirm via GoDaddy
7. After verified: **Sitemaps** → submit `sitemap.xml`

The sitemap URL is `https://www.clarasdaydive.com/sitemap.xml` (also listed in `robots.txt`).

---

## Adding email later

Because GoDaddy still owns DNS, the client can add **MX** and **TXT** (SPF/DKIM) records anytime in GoDaddy — no AWS changes needed.

---

## Optional cleanup

A Route 53 hosted zone was created during an earlier attempt (`Z03201281HODQ56S8KSG9`). It is **not used** for Option B. Delete it in Route 53 if it still exists (~$0.50/month):

```bash
# List records first, delete non-default records, then delete zone in console
aws route53 delete-hosted-zone --id Z03201281HODQ56S8KSG9
```

(Delete all records except NS/SOA first, or use the console.)

> **Status:** This zone is already deleted (or not in the current AWS account) — no action needed.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Deploy fails: `ACM_CERT_ARN is required` | Add secret in GitHub |
| Deploy fails: cert not found | ARN must be **us-east-1** |
| Certificate stuck **Pending validation** | Check GoDaddy CNAME names/values; wait for DNS |
| HTTPS error on custom domain | Cert not Issued yet, or `www` CNAME not pointing to CloudFront |
| `@` doesn't work | Use GoDaddy forwarding to `www` |
| Ask Clara fails | CORS allows both apex and www in production |

---

## Alternative — Route 53 nameservers (Option A)

If you later move all DNS to Route 53, see git history or use SST `dns: sst.aws.dns({ zone: "..." })` without `dns: false`. Only do this if the client does not need GoDaddy DNS for email.

---

## Related docs

- [sheets-publish/CHECKLIST.md](./sheets-publish/CHECKLIST.md)
- [sheets-setup.md](./sheets-setup.md)
