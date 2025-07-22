# SwagExtensionStore

[![codecov](https://codecov.io/gh/shopware/SwagExtensionStore/graph/badge.svg?token=AW90I5IR2H)](https://codecov.io/gh/shopware/SwagExtensionStore)

**SwagExtensionStore** is the integrated Shopware Store for **Shopware 6**, enabling seamless extension management and offering direct access to the Shopware ecosystem right from your installation.

## Features

- **Shopware Store integration** for Shopware 6
- Extension discovery, download, and updates
- Direct publishing workflow for store releases


## About

SwagExtensionStore provides a tightly integrated extension marketplace experience within Shopware 6, supporting businesses and developers in discovering, purchasing, and managing extensions directly through their Shopware admin interface.

## Installation

> The SwagExtensionStore is usually bundled with Shopware 6 installations. If you need to set up the repository for development, follow standard Shopware plugin development procedures.

1. Clone this repository into your Shopware 6 custom plugins directory:
    ```
    git clone https://github.com/shopware/SwagExtensionStore.git
    ```
2. Install the dependencies and refresh the plugin list:
    ```
    bin/console plugin:refresh
    bin/console plugin:install --activate SwagExtensionStore
    bin/console cache:clear
    ```
3. Access the Extension Store through your Shopware Administration UI.

## Releasing a New Version

To publish a new version to the Shopware Store:

- Go to the **Actions** tab on GitHub.
- Select the **Release to Store** workflow.
- Click the **Run workflow** button.

This process creates a new release and publishes it directly to the Shopware Store.

## Contributing

We welcome contributions! Please refer to the [general Shopware contribution guidelines](https://developer.shopware.com/docs/resources/guidelines/code/contribution.html). Ensure your code follows project conventions and includes appropriate unit tests where applicable.

