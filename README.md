# 🚀 SAPUI5 Enterprise BaseController

A robust and enterprise-ready **`BaseController`** that centralizes common SAPUI5 functions, including messaging, navigation, asynchronous data handling, dynamic dialogs, and utility wrappers. This library promotes clean, maintainable, and highly reusable code across all view controllers in your application.

## ✨ Features Summary

This BaseController extends the standard `sap.ui.core.mvc.Controller` with essential utility methods to streamline development:

### 📢 Messaging & Notifications

| Method | Description |
| :--- | :--- |
| **`showToast`** | Displays a transient, non-blocking message toast. |
| **`showSuccess`, `showInfo`, `showWarning`, `showError`** | Displays standard SAP Fiori message box alerts with localization support. |
| **`showConfirmation`** | Displays a confirmation dialog and returns a **Promise** for the user's action (OK/Cancel). |
| **`showServiceError`** | Parses and displays detailed error messages from OData services (including inner error details). |

-----

### 🧭 Navigation & Core Access

| Method | Description |
| :--- | :--- |
| **`getRouter`** | Retrieves the router instance for navigation. |
| **`navTo`** | Simplified, consistent forward navigation to a specified route. |
| **`onNavBack`** | Handles back navigation, falling back to a specified home route if no browser history exists. |
| **`getModel`, `setModel`** | Unified getters and setters for view-specific models. |
| **`getProperty`, `setProperty`** | Safe accessors for reading and writing data in any view model. |
| **`getResourceBundle`, `getText`** | Convenient methods for accessing the i18n file and fetching localized text. |

-----

### 🛠️ Data, Service & UI Helpers

| Method | Description |
| :--- | :--- |
| **`withBusyIndicator`** | Wraps any **Promise** (e.g., OData call) with automatic **Busy Indicator** management. |
| **`callService`** | An asynchronous, **Promise-based** wrapper for OData CRUD operations (`read`, `create`, `update`, `remove`). |
| **`createEntityKey`** | Constructs the URI path for an OData entity key. |
| **`loadFromLocalStorage`, `saveToLocalStorage`** | Simple persistence wrappers for the browser's **Local Storage**. |
| **`exportTableToExcel`** | Client-side export of a table's content to an **Excel** file, configurable via custom data attributes. |

-----

### 🎭 Dynamic Dialogs & Fragments

| Method | Description |
| :--- | :--- |
| **`loadAsyncFragment`** | Asynchronously loads an **XML Fragment**, with lifecycle management options (`bAddAsDependent`) and automatic opening (`bOpenAsDialog`). |
| **`openDynamicSelectDialog`** | Opens a generic **`sap.m.SelectDialog`** for item selection (single or multi-select), returning selected items via a Promise. |
| **`openDigitalSignatureDialog`** | Opens a full-screen dialog for capturing a **digital signature**, returning the result as a Base64 string. |

-----

## 📦 Installation and Usage

### Prerequisites

  *   SAPUI5 / OpenUI5 environment (1.80+ recommended)
  *   Standard UI5 Project Structure
        

### Setup

1.  **Copy the BaseController:**
    Place the **`BaseController.js`** file into your application's controller folder (e.g., `webapp/controller/BaseController.js`).
        
2.  **Define i18n keys:**
    Ensure your **`i18n/i18n.properties`** file contains the required message keys for the messaging features:
        
    ```properties
    # Messaging Titles
    error.title=Error
    warning.title=Warning
    info.title=Information
    success.title=Success
    confirmation.title=Confirmation
    error.unknown=An unknown error has occurred.
    error.close=Close

    # Dialogs
    dialog.title=Item Selection
    dialog.noDataFound=No data found.
    digitalSignature.title=Digital Signature
    digitalSignature.clear=Clear
    digitalSignature.save=Save
    digitalSignature.cancel=Cancel

    ```

    
3\.  **Extend in your View Controllers:**
In every view controller, extend the **`BaseController`** instead of the standard `sap.ui.core.mvc.Controller`:
    
```javascript
// MyView.controller.js
sap.ui.define([
    "com/company/demo/controller/BaseController" // Path to your BaseController
], (BaseController) => {
    "use strict";

    return BaseController.extend("com.company.app.controller.MyView", {
        onSave: async function() {
            // Use the inherited helper function directly
            const bConfirmed = await this.showConfirmation("Do you want to proceed?");

            if (bConfirmed) {
                this.showToast("Saving data...");
                // Example OData Service Call
                // await this.withBusyIndicator(this.callService("create", "/Products", oPayload));
            }
        }
    });
});
```

## 📄 Demo Code

The repository includes a runnable demo view and controller (`Main.view.xml` and `Main.controller.js`) showcasing the implementation of almost every helper function. Use these files as a reference to see the methods in action.