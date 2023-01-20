# SwagExtensionStore

The integrated Shopware Store for Shopware 6.

## Releasing a new version

In order to release a new version, the following workflow has been established:

### Create a merge request

First, you should have a ticket/task in Jira to create a new release.
Use this ticket number to create merge request with the changes required to publish a new release.

Branch off the appropriate branch. Use
* `trunk` for the currently released Shopware major version or
* any `6.x` branch for older minor versions.

In your merge request you have to adjust the following files, starting with`composer.json`.

**Example for a new minor or patch version:**

```diff
{
    "name": "swag/swag-extension-store",
-   "version": "1.7.0",
+   "version": "1.8.0",
    "description": "SWAG Extension Store",
}
```

**Example for a new major version:**

```diff
{
    "name": "swag/swag-extension-store",
-   "version": "1.7.0",
+   "version": "2.0.0",
    "description": "SWAG Extension Store",
    "require": {
-       "shopware/core": "~6.4",
-       "shopware/administration": "~6.4"
+       "shopware/core": "~6.5",
+       "shopware/administration": "~6.5"
    },
}
```

Next up, check the changelog files and, if necessary, add missing entries.
Please keep in mind, that the **target audience** of the changelog file are **end-users** of the plugin.
The changelog of the markdown files is used to generate the release notes on the plugin detail page in the Shopware Store.

We maintain changelogs for the English (`en-GB`) and German (`de-DE`) languages. The format of the changelog files reads as follows:

```markdown
# 1.0.0
- Notable change
- Another notable change
- A very important bug fix

# 2.0.0
- Notable change
- Another notable change
- A very important bug fix
```

Last, but not least, and this is especially true for new **major releases**, make sure to be **compatible** with the latest (breaking) changes of Shopware 6. 

After your MR has been reviewed, merge it back to the appropriate branch (see above at the start of this section to understand which branch to use).

### Test the new release

By running the manual job `Build Zip`, the pipeline will provide you with a readily usable ZIP file of the plugin.

This ZIP file can be used to upload the plugin
* to your local Shopware 6 development environment or
* the staging environment of the Shopware Store.

To do the latter, log into [https://sbp-next-frontend.shopware.in](https://sbp-next-frontend.shopware.in) to search for and open the plugin in the extension overview.
From there, navigate to the manufacturer and click the `Login as admin` button to be logged in as the manufacturer automatically at [https://sbp-next-account.shopware.in](https://sbp-next-account.shopware.in)

Once inside the Shopware Account, go to the manufacturer's area and open the plugin from the overview page.
Create a new version and upload the ZIP file from the pipeline.
Make sure, to correctly mark the compatibility with the appropriate major Shopware version.
After doing so, request an automatic code review by clicking the `Request code review` button.

After the code review has been completed, the plugin is released and can be downloaded through
* the Shopware Store inside the Shopware Administration and/or
* the Shopware Account manually.

### Branch off a new release branch

For every release that we publish, we create a new release branch, after the version has been tested successfully.
This release branch is branched off the appropriate branch (see the start of the [Create a merge request](#create-a-merge-request) section to understand which branch to use).

### Create a new tag

On the newly created release branch, create a matching tag for the release, which is prefixed with a `v`.

**Example:** You have prepared, tested and branched off `1.8.0` from the `6.4` branch.
Now, you create a new tag **on this branch** with the name `v1.8.0`.

### Upload the new version to the Shopware Store

Once the automatic pipeline for the newly created tag completed successfully, run the manual jobs `Build Zip` and `Upload to Store`.

Lastly, go to the manufacturer's area of the [Shopware Account](https://account.shopware.com) and check if the compatibility is set correctly.
See the [Test the new release](#test-the-new-release) section and follow the steps **but** make sure to do this on the production environment [https://sbp.shopware.com](https://sbp.shopware.com).
