sap.ui.define([
    "com/company/demo/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (BaseController, JSONModel, MessageBox) => {
    "use strict";

    /**
     * =================================================================
     * MOCK DATA AND CONSTANTS
     * Kept outside the controller implementation for better separation.
     * =================================================================
     */

    // --- Product Data ---
    const MOCK_PRODUCTS = [{
        ProductID: 1,
        Name: "Laptop",
        Price: 1200
    }, {
        ProductID: 2,
        Name: "Mouse",
        Price: 25
    }, {
        ProductID: 3,
        Name: "Monitor",
        Price: 350
    }, {
        ProductID: 4,
        Name: "Keyboard",
        Price: 75
    }, {
        ProductID: 5,
        Name: "Webcam",
        Price: 50
    },];

    // --- Mock Service Error Object ---
    const MOCK_SERVICE_ERROR = {
        responseText: JSON.stringify({
            error: {
                code: "SY/530",
                message: {
                    lang: "en",
                    value: "An unexpected critical error occurred during the process."
                },
                innererror: {
                    errordetails: [{
                        severity: "error",
                        message: "User authorization is missing for this action. Access denied.",
                        code: "AUTH/001"
                    }, {
                        severity: "warning",
                        message: "The price field was left empty; a default value of 1.00 was assigned.",
                        code: "FIELD/002"
                    }, {
                        severity: "info",
                        message: "The request completed with a 200ms delay. Consider optimization.",
                        code: "PERF/003"
                    }]
                }
            }
        })
    };

    /**
     * =================================================================
     * CONTROLLER IMPLEMENTATION
     * =================================================================
     */

    return BaseController.extend("com.company.demo.controller.Home", {

        /**
         * Lifecycle Methods
         */
        onInit() {
            // Default Model: For table and data demos
            this.setModel(new JSONModel({
                Products: MOCK_PRODUCTS
            }));

            // Global Model: For application-wide state or user data
            this.setModel(new JSONModel({
                User: {
                    Name: "",
                    Age: 0
                }
            }), "globalModel");

            this._oDialogFragment = null; // Private variable to hold the fragment instance
        },

        // ---

        /**
         * Messaging and Notification Demos
         */
        onShowToast() {
            this.showToast(this.getText("info.title") + ": This is a brief toast message!");
        },

        onShowSuccess() {
            this.showSuccess("The operation was completed successfully!", "Successful Operation");
        },

        onShowInfo() {
            this.showInfo("Would you like to learn about the new features?", "Important Announcement");
        },

        onShowWarning() {
            this.showWarning("Some fields were left empty in the form.", "Form Warning");
        },

        onShowError() {
            // Demo showing both Error object and string message handling
            const oError = new Error("A critical database connection error has occurred.");
            this.showError(oError);
        },

        async onShowConfirmation() {
            const bConfirmed = await this.showConfirmation("Are you sure you want to confirm this action? It cannot be undone.", "Confirmation Required");
            this.showToast(`User ${bConfirmed ? "CONFIRMED" : "CANCELED"} the action.`);
        },

        // ---

        /**
         * Loading and Service Demos
         */
        onShowBusyIndicator() {
            this.showBusyIndicator(0); // Show immediately
            setTimeout(() => {
                this.hideBusyIndicator();
                this.showToast("Busy Indicator closed after 5 seconds.");
            }, 5000); // Close after 5 seconds
        },

        async onCallServiceDemo() {
            try {
                // Demonstrate `withBusyIndicator` usage with a simulated Promise for an async service call
                const sMessage = await this.withBusyIndicator(
                    new Promise(resolve => setTimeout(() => resolve("Simulated OData service call successful!"), 2000)) // 2 seconds delay
                );
                this.showSuccess(sMessage);
            } catch (error) {
                this.showError(error);
            }
        },

        onShowServiceError() {
            // Use the mock error object to demonstrate the detailed service error dialog
            this.showServiceError(MOCK_SERVICE_ERROR);
        },

        // ---

        /**
         * Data Management Demos (Model, LocalStorage)
         */
        onModelDataDemo() {
            // Demonstrate setProperty / getProperty
            this.setProperty("/User/Name", "Alice", "globalModel");
            this.setProperty("/User/Age", 30, "globalModel");

            const sName = this.getProperty("/User/Name", "globalModel");
            this.showInfo(`Model Property Read: User Name is ${sName}`, "Model Operation");

            // Check for non-existent property/model
            const sNonExistent = this.getProperty("/NonExistent", "NonExistentModel");
            console.log("Non-Existent Property Check:", sNonExistent); // Returns null
        },

        onLocalStorageDemo() {
            const sKey = "DEMO_USER_PREFS";
            const oData = {
                theme: "sap_horizon",
                language: "EN",
                lastAction: new Date().toISOString()
            };

            // Save
            this.saveToLocalStorage(sKey, oData);
            this.showToast(`Data saved to local storage with key '${sKey}'.`);

            // Load
            const oLoadedData = this.loadFromLocalStorage(sKey);
            if (oLoadedData) {
                MessageBox.information(
                    `Loaded Data:\nTheme: ${oLoadedData.theme}\nLast Action: ${new Date(oLoadedData.lastAction).toLocaleTimeString()}`, {
                    title: "Local Storage Data"
                }
                );
            }
        },

        // ---

        /**
         * Dialog and Popup Demos
         */
        async onOpenSelectDialog() {
            const aData = MOCK_PRODUCTS.map(p => ({
                id: p.ProductID,
                title: p.Name,
                description: `Unit Price: ${p.Price} USD`
            }));

            // Single Selection Demo
            const oSelectedItem = await this.openDynamicSelectDialog({
                aData: aData,
                oMapping: {
                    title: "{title}",
                    description: "{description}"
                },
                sTitle: "Select a Product (Single Selection)",
                aSearchFields: ["title", "description"]
            });

            if (oSelectedItem) {
                this.showSuccess(`Selected Item: ${oSelectedItem.title} (ID: ${oSelectedItem.id})`);
            } else {
                this.showToast("Selection was canceled by the user.");
            }
        },

        async onOpenSignatureDialog() {
            const sSignatureDataUrl = await this.openDigitalSignatureDialog({
                title: "Customer Approval Signature",
                width: 450,
                height: 250
            });

            if (sSignatureDataUrl) {
                // sSignatureDataUrl is a Base64 JPEG string
                this.showSuccess(`Signature captured successfully! Base64 Data Length: ${sSignatureDataUrl.length} bytes.`, "Signature Success");
            } else {
                this.showToast("Digital signature process was canceled.");
            }
        },

        // ---

        /**
         * Output and Export Demos
         */
        async onExportToExcel() {
            try {
                // The function uses the table ID and looks for 'data:export' attributes on columns.
                await this.withBusyIndicator(
                    this.exportTableToExcel("productsTable", "Product_Inventory_Export")
                );
                this.showSuccess("The product table data was successfully exported to an Excel file!", "Export Successful");
            } catch (error) {
                console.error("Export Error:", error);
                this.showError("An error occurred during the export process: " + error.message);
            }
        },

        // ---

        /**
         * Navigation and Fragment Demos
         */
        onNavBack() {
            // Calls the BaseController's onNavBack method, with "RouteHome" as a fallback
            this.onNavBack("RouteHome");
            this.showToast("Navigation Back executed (simulated fallback to RouteHome).");
        },

        async onLoadFragmentDemo() {
            try {
                this.showBusyIndicator(0);

                // Load the fragment and get the control instance
                this._oDialogFragment ??= await this.loadAsyncFragment({
                    sName: "com.company.demo.view.DemoFragment",
                    oController: this, // Pass the current controller for event handling
                    bAddAsDependent: true, // Recommended for dialogs/popovers managed by the controller
                    bOpenAsDialog: false
                });

                this._oDialogFragment.open();

                this.showToast("Fragment loaded and opened successfully!");
            } catch (error) {
                console.error("Fragment loading error:", error);
                this.showError("Failed to load fragment: " + error.message);
            } finally {
                this.hideBusyIndicator();
            }
        },

        onCloseFragment() {
            if (this._oDialogFragment) {
                this._oDialogFragment.close();
                // Optionally destroy the fragment if it's a transient dialog
                this._oDialogFragment.destroy();
                this._oDialogFragment = null;
                this.showToast("Fragment Dialog closed.");
            }
        },
    });
});