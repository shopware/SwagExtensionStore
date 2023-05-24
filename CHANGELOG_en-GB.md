# 1.0.0
- First release in Store

# 1.1.0
- Fixed a wrong behavior when user has no payment method
- A warning is now displayed if the user has not configured a payment method

# 1.2.0
- If the installation of an extension failed, an error modal is displayed on the extension detail page
- A checkbox for the AVV is now also displayed if no permissions are required
- Fixed a bug in the RouteMiddleware. This caused that some plugins could no longer extend routes

# 1.3.0
- Fix annotation in route that breaks compatibility
- Keep search term when navigation through the extension store
- Fix detail page of Enterprise extensions

# 1.4.0
- Fix price precision display in extension buy modal
- Improved and refactored price display on buy detail page and in buy modal
- Added a placeholder to the search bar and renamed the `initialSearchType`
- Improved error messages
- Fixed a bug that didn't reset the page when switching between tabs
- Improved display in buy modal, if trial month has been already used
- Improved error handling in the order process in the buy modal

# 1.4.1
- Fixed bug that kept the buy modal in loading state after changing the variant

# 1.5.0
- Fixed bug that didn't interrupt the buying process in case of an error
- Changed calling of the `getCart` method in the component `sw-extension-buy-modal` to ensure that no second request is sent unnecessarily.
- Increases the version of the `@shopware-ag/jest-preset-sw6-admin` package
- Filter for the categories now has more levels, for more filter options

# 1.6.0
- Improved loading animation in listing

# 2.0.0
- Compatibility with Shopware 6.5

# 2.1.0
- Improved various styles in listing and on detail page
- Removed short description from detail page header
- Changed appearance of ratings stars in listing and on detail page
- Reload the administration after installing a plugin
- Fixed an error in the CSS of the login modal on the extension detail page
