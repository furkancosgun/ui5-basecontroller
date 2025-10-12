sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/m/Dialog",
    "sap/m/MessageView",
    "sap/m/MessageItem",
    "sap/m/Button",
    "sap/m/Bar",
    "sap/m/Text",
    "sap/ui/model/json/JSONModel",
    "sap/m/StandardListItem",
    "sap/m/SelectDialog",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/util/Storage",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/ui/core/HTML",
    "sap/ui/export/Spreadsheet"
], (
    Controller,
    History,
    MessageBox,
    MessageToast,
    BusyIndicator,
    Dialog,
    MessageView,
    MessageItem,
    Button,
    Bar,
    Text,
    JSONModel,
    StandardListItem,
    SelectDialog,
    Filter,
    FilterOperator,
    Storage,
    HBox,
    VBox,
    HTML,
    Spreadsheet
) => {
    "use strict";

    // --- I18N Keys Constant ---
    const I18N_KEYS = {
        ERROR_TITLE: "error.title",
        WARNING_TITLE: "warning.title",
        INFO_TITLE: "info.title",
        SUCCESS_TITLE: "success.title",
        CONFIRMATION_TITLE: "confirmation.title",
        ERROR_UNKNOWN: "error.unknown",
        ERROR_CLOSE: "error.close",
        DIALOG_TITLE: "dialog.title",
        DIALOG_NO_DATA_FOUND: "dialog.noDataFound",
        DIGITAL_SIGNATURE_TITLE: "digitalSignature.title",
        DIGITAL_SIGNATURE_CLEAR: "digitalSignature.clear",
        DIGITAL_SIGNATURE_SAVE: "digitalSignature.save",
        DIGITAL_SIGNATURE_CANCEL: "digitalSignature.cancel",
    };

    return Controller.extend("com.company.demo.controller.BaseController", {

        // =================================================================
        // GETTERS / SETTERS & NAVIGATION
        // =================================================================

        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} The router for this component.
         */
        getRouter() {
            return this.getOwnerComponent().getRouter();
        },

        /**
         * Convenience method for getting a view model.
         * @public
         * @param {string} [sName] The model name.
         * @returns {sap.ui.model.Model | undefined} The model instance.
         */
        getModel(sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Sets a view model.
         * @public
         * @param {sap.ui.model.Model} oModel The model instance.
         * @param {string} [sName] The model name.
         * @returns {this} The controller instance for chaining.
         */
        setModel(oModel, sName) {
            this.getView().setModel(oModel, sName);
            return this;
        },

        /**
         * Gets a property value from a model.
         * @public
         * @param {string} sPath The binding path (e.g., "/Users/0/Name").
         * @param {string} [sName] The model name (optional).
         * @returns {any | null} The property value or `null` if the model doesn't exist.
         */
        getProperty(sPath, sName) {
            const oModel = this.getModel(sName);
            return oModel?.getProperty(sPath) ?? null;
        },

        /**
         * Sets a property value in a model.
         * @public
         * @param {string} sPath The binding path.
         * @param {any} vValue The value to set.
         * @param {string} [sName] The model name (optional).
         */
        setProperty(sPath, vValue, sName) {
            const oModel = this.getModel(sName);
            if (oModel) {
                oModel.setProperty(sPath, vValue);
            }
        },

        /**
         * Gets the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceBundle} The resourceBundle of the component's i18n model.
         */
        getResourceBundle() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Gets i18n text from the resource bundle.
         * @public
         * @param {string} sKey The i18n text key.
         * @param {Array<string>} [aParams] Optional parameters for the text.
         * @returns {string} The translated text.
         */
        getText(sKey, aParams) {
            return this.getResourceBundle().getText(sKey, aParams);
        },

        /**
         * Navigates to a route with optional parameters.
         * @public
         * @param {string} sRouteName The route name.
         * @param {object} [oParams={}] The route parameters.
         * @param {object} [oComponentTargetInfo={}] The component target info (if routing to another component).
         */
        navTo(sRouteName, oParams = {}, oComponentTargetInfo = {}) {
            this.getRouter().navTo(sRouteName, oParams, oComponentTargetInfo);
        },

        /**
         * Navigates back in history or to a fallback route.
         * @public
         * @param {string} [sFallbackRoute="RouteHome"] The route to navigate to if no history exists.
         */
        onNavBack(sFallbackRoute) {
            const sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash) {
                window.history.go(-1);
            } else {
                this.navTo(sFallbackRoute || "RouteHome");
            }
        },

        // =================================================================
        // BUSY INDICATOR & PROMISE MANAGEMENT
        // =================================================================

        /**
         * Shows a busy indicator.
         * @public
         * @param {number} [iDelay=0] The delay in milliseconds before opening.
         */
        showBusyIndicator(iDelay = 0) {
            BusyIndicator.show(iDelay);
        },

        /**
         * Hides the busy indicator.
         * @public
         */
        hideBusyIndicator() {
            BusyIndicator.hide();
        },

        /**
         * Executes a Promise and shows a busy indicator during its execution.
         * @public
         * @template T
         * @param {Promise<T>} oPromise The promise to wait for.
         * @returns {Promise<T>} The result of the promise.
         */
        async withBusyIndicator(oPromise) {
            this.showBusyIndicator();
            try {
                return await oPromise;
            } finally {
                this.hideBusyIndicator();
            }
        },

        // =================================================================
        // MESSAGING (TOAST / DIALOGS)
        // =================================================================

        /**
         * Shows a brief toast message at the bottom of the screen.
         * @public
         * @param {string} sMessage The message to show.
         */
        showToast(sMessage) {
            MessageToast.show(sMessage);
        },

        /**
         * Shows an error dialog and returns a Promise that resolves when the dialog is closed.
         * @public
         * @param {string|Error} vError The error message or Error object.
         * @param {string} [sTitle] The dialog title.
         * @returns {Promise<string>} A Promise that resolves with the action taken to close the dialog.
         */
        showError(vError, sTitle) {
            const sMessage = typeof vError === "string" ? vError : vError.message || this.getText(I18N_KEYS.ERROR_UNKNOWN);
            return new Promise((resolve) => {
                MessageBox.error(sMessage, {
                    title: sTitle || this.getText(I18N_KEYS.ERROR_TITLE),
                    onClose: resolve
                });
            });
        },

        /**
         * Shows a success dialog and returns a Promise that resolves when the dialog is closed.
         * @public
         * @param {string} sMessage The success message.
         * @param {string} [sTitle] The dialog title.
         * @returns {Promise<string>} A Promise that resolves with the action taken to close the dialog.
         */
        showSuccess(sMessage, sTitle) {
            return new Promise((resolve) => {
                MessageBox.success(sMessage, {
                    title: sTitle || this.getText(I18N_KEYS.SUCCESS_TITLE),
                    onClose: resolve
                });
            });
        },

        /**
         * Shows an information dialog and returns a Promise that resolves when the dialog is closed.
         * @public
         * @param {string} sMessage The information message.
         * @param {string} [sTitle] The dialog title.
         * @returns {Promise<string>} A Promise that resolves with the action taken to close the dialog.
         */
        showInfo(sMessage, sTitle) {
            return new Promise((resolve) => {
                MessageBox.information(sMessage, {
                    title: sTitle || this.getText(I18N_KEYS.INFO_TITLE),
                    onClose: resolve
                });
            });
        },

        /**
         * Shows a warning dialog and returns a Promise that resolves when the dialog is closed.
         * @public
         * @param {string} sMessage The warning message.
         * @param {string} [sTitle] The dialog title.
         * @returns {Promise<string>} A Promise that resolves with the action taken to close the dialog.
         */
        showWarning(sMessage, sTitle) {
            return new Promise((resolve) => {
                MessageBox.warning(sMessage, {
                    title: sTitle || this.getText(I18N_KEYS.WARNING_TITLE),
                    onClose: resolve
                });
            });
        },

        /**
         * Shows a confirmation dialog and returns a Promise that resolves with a boolean.
         * @public
         * @param {string} sMessage The confirmation message.
         * @param {string} [sTitle] The dialog title.
         * @returns {Promise<boolean>} A Promise that resolves to `true` if confirmed (OK), `false` otherwise (Cancel).
         */
        showConfirmation(sMessage, sTitle) {
            return new Promise((resolve) => {
                MessageBox.confirm(sMessage, {
                    title: sTitle || this.getText(I18N_KEYS.CONFIRMATION_TITLE),
                    onClose: (oAction) => resolve(oAction === MessageBox.Action.OK)
                });
            });
        },

        /**
         * Shows a detailed service error dialog, attempting to parse error details.
         * If detailed error items are found, a MessageView dialog is opened.
         * @public
         * @param {object} oError The error object from the service call (typically containing `responseText`).
         */
        showServiceError(oError) {
            try {
                const oErrorData = JSON.parse(oError.responseText)?.error;
                if (oErrorData?.innererror?.errordetails) {
                    this._showDetailedServiceError(oErrorData.innererror.errordetails);
                } else {
                    MessageBox.error(oErrorData?.message?.value || this.getText(I18N_KEYS.ERROR_UNKNOWN), {
                        details: oErrorData?.innererror
                    });
                }
                console.error("Service Error:", oError);
            } catch (e) {
                console.error("Error parsing/processing service error:", e);
                this.showError(this.getText(I18N_KEYS.ERROR_UNKNOWN));
            }
        },

        // =================================================================
        // ODATA / SERVICE UTILITIES
        // =================================================================

        /**
         * Executes a Promise-based OData service call (assuming an OData model is set on the Component).
         * @public
         * @param {"read" | "create" | "update" | "remove"} sMethod The OData method.
         * @param {string} sPath The EntitySet path or entity path.
         * @param {object} [oPayload] The payload for "create" or "update" operations.
         * @param {object} [oParams] Additional OData parameters (e.g., urlParameters, filters).
         * @returns {Promise<any>} A Promise that resolves with the result of the operation.
         */
        callService(sMethod, sPath, oPayload, oParams) {
            const oModel = this.getOwnerComponent().getModel();
            if (!oModel || typeof oModel[sMethod] !== "function") {
                return Promise.reject(new Error(`OData method '${sMethod}' not found on the model.`));
            }

            return new Promise((resolve, reject) => {
                const aArgs = [sPath];
                if (sMethod !== "read") {
                    aArgs.push(oPayload || {});
                }
                aArgs.push({
                    ...oParams,
                    success: (oData) => {
                        // Resolve with oData.results for collections, or oData for single entries/results
                        resolve(sMethod === "read" ? (oData.results || oData) : oData);
                    },
                    error: reject
                });
                oModel[sMethod].apply(oModel, aArgs);
            });
        },

        /**
         * Creates a URI path for a specific OData entity based on its key properties.
         * @public
         * @param {string} sEntitySet The name of the EntitySet.
         * @param {object} oKeyObject The object containing the key properties and values.
         * @returns {string} The URI path for the entity (e.g., "/Products('123')").
         */
        createEntityKey(sEntitySet, oKeyObject) {
            const oModel = this.getOwnerComponent().getModel();
            if (!oModel) {
                throw new Error("OData model is not available.");
            }
            return oModel.createKey(sEntitySet, oKeyObject);
        },

        // =================================================================
        // LOCAL STORAGE UTILITIES
        // =================================================================

        /**
         * Saves a key-value pair to the local storage (data is JSON stringified).
         * @public
         * @param {string} sKey The key to store the data.
         * @param {any} vValue The data to be stored.
         */
        saveToLocalStorage(sKey, vValue) {
            if (!sKey || vValue === undefined) {
                return;
            }
            const oStorage = Storage.get(Storage.Type.local);
            oStorage.put(sKey, JSON.stringify(vValue));
        },

        /**
         * Retrieves a value from the local storage (data is JSON parsed).
         * @public
         * @param {string} sKey The key of the data.
         * @returns {any | null} The retrieved data or `null` if not found.
         */
        loadFromLocalStorage(sKey) {
            const oStorage = Storage.get(Storage.Type.local);
            const sValue = oStorage.get(sKey);
            try {
                return sValue ? JSON.parse(sValue) : null;
            } catch (e) {
                console.error(`Error parsing Local Storage key ${sKey}:`, e);
                return null;
            }
        },

        // =================================================================
        // FRAGMENT / DIALOGS
        // =================================================================

        /**
         * Loads an XML Fragment asynchronously.
         * @public
         * @param {object} oOptions - Configuration options for loading the fragment.
         * @param {string} oOptions.sName - The name of the fragment (e.g., "com.company.demo.view.MyFragment").
         * @param {sap.ui.core.mvc.Controller} [oOptions.oController=this] - The controller instance to attach events to.
         * @param {boolean} [oOptions.bOpenAsDialog=false] - If true, the loaded control (expected to be a sap.m.Dialog/Popover) will be opened automatically.
         * @param {boolean} [oOptions.bAddAsDependent=false] - If true, ensures the fragment inherits view models and is destroyed with the view.
         * @returns {Promise<sap.ui.core.Control>} A Promise that resolves with the fragment's root control instance.
         */
        async loadAsyncFragment(oOptions) {
            const {
                sName,
                oController = this,
                bOpenAsDialog = false,
                bAddAsDependent = false
            } = oOptions;

            if (!sName) {
                throw new Error("Fragment name (sName) is required for loadAsyncFragment.");
            }

            // Check for native loadFragment availability
            if (typeof this.loadFragment !== "function") {
                throw new Error("The native loadFragment method is not available on this controller instance. SAPUI5 version might be too old or method not mixed in.");
            }

            const oFragment = await this.loadFragment({
                name: sName,
                controller: oController
            });

            if (bAddAsDependent) {
                this.getView().addDependent(oFragment);
            }

            if (bOpenAsDialog && oFragment.open) {
                oFragment.open();
            }

            return oFragment;
        },

        /**
         * Opens a dynamic SelectDialog for item selection and returns a Promise.
         * @public
         * @param {object} oOptions - Configuration for the dialog.
         * @param {string} [oOptions.sTitle] - The title of the dialog. Defaults to i18n key "dialog.title".
         * @param {Array<object>} oOptions.aData - The data array to be displayed in the list.
         * @param {object} [oOptions.oMapping] - The list item binding mapping. Defaults to `{title: '{title}', description: '{description}'}`.
         * @param {string} [oOptions.sNoDataText] - The text to display when the list is empty. Defaults to i18n key "dialog.noDataFound".
         * @param {Array<string>} [oOptions.aSearchFields] - The fields to search within the data. Defaults to `["title", "description"]`.
         * @param {boolean} [oOptions.bMultiSelect=false] - Whether multi-selection is enabled.
         * @returns {Promise<object | object[] | null>} A Promise that resolves with the selected item(s) or `null` if the dialog is canceled.
         */
        openDynamicSelectDialog(oOptions) {
            return new Promise((resolve) => {
                const {
                    aData,
                    oMapping = {
                        title: `{title}`,
                        description: `{description}`
                    },
                    sTitle = this.getText(I18N_KEYS.DIALOG_TITLE),
                    sNoDataText = this.getText(I18N_KEYS.DIALOG_NO_DATA_FOUND),
                    aSearchFields = ["title", "description"],
                    bMultiSelect = false
                } = oOptions;

                const oModel = new JSONModel(aData);
                const oSelectDialogItem = new StandardListItem(oMapping);

                const oSelectDialog = new SelectDialog({
                    title: sTitle,
                    noDataText: sNoDataText,
                    multiSelect: bMultiSelect,
                    items: {
                        path: "/",
                        template: oSelectDialogItem
                    },
                    search: (oEvent) => {
                        const sValue = oEvent.getParameter("value");
                        const aSearchFilters = aSearchFields.map(field => new Filter(field, FilterOperator.Contains, sValue));
                        const oCombinedFilter = new Filter({
                            filters: aSearchFilters,
                            or: true
                        });
                        oSelectDialog.getBinding("items").filter(sValue ? [oCombinedFilter] : []);
                    },
                    confirm: (oEvent) => {
                        const aSelectedItems = oEvent.getParameter("selectedItems");
                        const aSelectedObjects = aSelectedItems.map(item => item.getBindingContext().getObject());
                        const result = bMultiSelect ? aSelectedObjects : (aSelectedObjects[0] ?? null);
                        oSelectDialog.destroy();
                        resolve(result);
                    },
                    cancel: () => {
                        oSelectDialog.destroy();
                        resolve(null);
                    }
                });

                oSelectDialog.setModel(oModel);
                oSelectDialog.open(null);
            });
        },

        /**
         * Opens a dialog for digital signature and returns a Promise with the Base64 image data.
         * @public
         * @param {object} [oOptions={}] - Configuration options for the dialog.
         * @param {string} [oOptions.title] - Dialog title. Defaults to i18n key "digitalSignature.title".
         * @param {number} [oOptions.width=350] - Width of the signature canvas.
         * @param {number} [oOptions.height=350] - Height of the signature canvas.
         * @returns {Promise<string|null>} - A Promise that resolves with the signature data (Base64 JPEG image) or `null` if the dialog is canceled.
         */
        openDigitalSignatureDialog(oOptions = {}) {
            return new Promise((resolve, reject) => {
                const {
                    title = this.getText(I18N_KEYS.DIGITAL_SIGNATURE_TITLE),
                    width = 350,
                    height = 350,
                    lineWidth = 2,
                    lineCap = "round",
                    strokeStyle = "#000000",
                    fillStyle = "#fff",
                } = oOptions;

                // Canvas HTML content
                const sHtmlContent = `<canvas id='signatureCanvas' width='${width}' height='${height}' style='border:1px solid #000; background-color: #fff; touch-action: none;'></canvas>`;

                const oHtml = new HTML({
                    content: sHtmlContent,
                    // Signature logic handled after canvas is rendered
                    afterRendering: () => {
                        const canvas = document.getElementById('signatureCanvas');
                        if (!canvas) {
                            reject(new Error("Signature canvas not found after rendering."));
                            return;
                        }

                        const ctx = canvas.getContext("2d");
                        let isDrawing = false;
                        let lastX = 0;
                        let lastY = 0;

                        // Initial setup
                        ctx.lineWidth = lineWidth;
                        ctx.lineCap = lineCap;
                        ctx.strokeStyle = strokeStyle;
                        ctx.fillStyle = fillStyle;
                        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill background

                        // Helper function to get correct coordinates for touch events
                        const getCoords = (e) => {
                            if (e.touches && e.touches.length > 0) {
                                const touch = e.touches[0];
                                const rect = canvas.getBoundingClientRect();
                                return {
                                    offsetX: touch.clientX - rect.left,
                                    offsetY: touch.clientY - rect.top
                                };
                            }
                            return {
                                offsetX: e.offsetX,
                                offsetY: e.offsetY
                            };
                        };

                        const draw = (e) => {
                            if (!isDrawing) return;
                            const {
                                offsetX,
                                offsetY
                            } = getCoords(e);
                            ctx.beginPath();
                            ctx.moveTo(lastX, lastY);
                            ctx.lineTo(offsetX, offsetY);
                            ctx.stroke();
                            [lastX, lastY] = [offsetX, offsetY];
                        };

                        const startDrawing = (e) => {
                            isDrawing = true;
                            const {
                                offsetX,
                                offsetY
                            } = getCoords(e);
                            [lastX, lastY] = [offsetX, offsetY];
                            draw(e); // Draw a dot if it's just a tap/click
                        };

                        const stopDrawing = () => {
                            isDrawing = false;
                        };

                        // Event listeners for mouse
                        canvas.addEventListener('mousedown', startDrawing);
                        canvas.addEventListener('mousemove', draw);
                        canvas.addEventListener('mouseup', stopDrawing);
                        canvas.addEventListener('mouseout', stopDrawing);

                        // Event listeners for touch (passive: false to prevent scrolling)
                        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); }, { passive: false });
                        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); }, { passive: false });
                        canvas.addEventListener('touchend', stopDrawing);
                        canvas.addEventListener('touchcancel', stopDrawing);
                    },
                });

                const oDialog = new Dialog({
                    title: title,
                    contentWidth: `${width}px`,
                    content: [
                        new VBox({
                            items: [
                                oHtml,
                                new HBox({
                                    justifyContent: "End",
                                    items: [
                                        new Button({
                                            text: this.getText(I18N_KEYS.DIGITAL_SIGNATURE_CLEAR),
                                            type: "Reject",
                                            press: () => {
                                                const canvas = document.getElementById('signatureCanvas');
                                                if (canvas) {
                                                    const ctx = canvas.getContext("2d");
                                                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                                                    ctx.fillStyle = fillStyle;
                                                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                                                }
                                            },
                                        }),
                                        new Button({
                                            text: this.getText(I18N_KEYS.DIGITAL_SIGNATURE_SAVE),
                                            type: "Emphasized",
                                            press: () => {
                                                const canvas = document.getElementById('signatureCanvas');
                                                if (canvas) {
                                                    // Convert to Base64 JPEG string
                                                    const dataUrl = canvas.toDataURL("image/jpeg");
                                                    oDialog.close();
                                                    resolve(dataUrl);
                                                } else {
                                                    oDialog.close();
                                                    reject(new Error("Canvas object not found on save."));
                                                }
                                            },
                                        }).addStyleClass("sapUiSmallMarginBegin"),
                                    ],
                                }).addStyleClass("sapUiSmallMarginTop"),
                            ],
                        }).addStyleClass("sapUiTinyMargin"),
                    ],
                    endButton: new Button({
                        text: this.getText(I18N_KEYS.DIGITAL_SIGNATURE_CANCEL),
                        press: () => {
                            oDialog.close();
                            resolve(null);
                        },
                    }),
                    afterClose: () => {
                        oDialog.destroy();
                    },
                });

                oDialog.open();
            });
        },


        // =================================================================
        // EXPORT UTILITIES
        // =================================================================

        /**
         * Dynamically exports a table's data to an Excel (.xlsx) spreadsheet using sap.ui.export.Spreadsheet.
         * The columns are dynamically configured based on visible table columns and their custom 'export.*' properties.
         * @public
         * @param {string|sap.ui.table.Table|sap.m.Table} vTable - The ID of the table control or the control instance itself.
         * @param {string} [sFileName="Export"] - The desired file name for the exported spreadsheet (without extension).
         * @returns {Promise<void>} A Promise that resolves when the export is complete.
         */
        async exportTableToExcel(vTable, sFileName = "Export") {
            const oTable = typeof vTable === "string" ? this.getView().byId(vTable) : vTable;

            if (!oTable) {
                console.error("Table control not found:", vTable);
                return;
            }

            // 1. Map UI table columns to Spreadsheet column format using CustomData
            const aColumns = oTable
                .getColumns()
                .map(oColumn => {
                    // Use a guard clause for columns without export properties
                    const columnData = oColumn.data();
                    const property = columnData["export.property"];
                    if (!property) return null;

                    return {
                        label: columnData["export.label"],
                        property: property,
                        type: columnData["export.type"]
                    };
                })
                .filter(column => column !== null);

            // 2. Get the data source (binding)
            const oDataSource = oTable.getBinding("items") || oTable.getBinding("rows");

            if (!oDataSource) {
                console.warn("Table data binding not found. Cannot export.");
                return;
            }

            // 3. Create and build the spreadsheet
            const oSettings = {
                workbook: {
                    columns: aColumns,
                },
                dataSource: oDataSource,
                fileName: sFileName,
                worker: false // Disable worker for async/await simplicity
            };

            const oSpreadsheet = new Spreadsheet(oSettings);
            await oSpreadsheet.build();
            oSpreadsheet.destroy();
        },

        // =================================================================
        // PRIVATE UTILITIES
        // =================================================================

        /**
         * Converts a service error severity type to a UI5 MessageType enumeration value.
         * @private
         * @param {string} sType The error type (e.g., "info", "warning", "error").
         * @returns {string} The converted UI5 MessageType (e.g., "Information", "Warning", "Error").
         */
        _serviceTypeToUI5MessageType(sType) {
            const sNormalizedType = sType?.toLowerCase();
            switch (sNormalizedType) {
                case "info":
                    return "Information";
                default:
                    // Capitalize first letter (e.g., "error" -> "Error")
                    return sNormalizedType ? sNormalizedType.charAt(0).toUpperCase() + sNormalizedType.slice(1) : "Error";
            }
        },

        /**
         * Shows detailed service errors in a dialog using MessageView.
         * @private
         * @param {Array<object>} aErrorDetails The array of error details from the service's innererror.
         */
        _showDetailedServiceError(aErrorDetails) {
            const aMessageItems = aErrorDetails.map(detail => ({
                type: this._serviceTypeToUI5MessageType(detail.severity),
                title: this._serviceTypeToUI5MessageType(detail.severity),
                subtitle: detail.message,
                description: detail.message
            }));

            const oMessageView = new MessageView({
                showDetailsPageHeader: true,
                items: {
                    path: "/",
                    template: new MessageItem({
                        type: "{type}",
                        title: "{title}",
                        subtitle: "{subtitle}",
                        description: "{description}"
                    })
                }
            });
            oMessageView.setModel(new JSONModel(aMessageItems));

            const oDialog = new Dialog({
                resizable: true,
                content: oMessageView,
                state: "Error",
                contentHeight: "400px",
                contentWidth: "600px",
                verticalScrolling: false,
                beginButton: new Button({
                    text: this.getText(I18N_KEYS.ERROR_CLOSE),
                    press: () => oDialog.close()
                }),
                customHeader: new Bar({
                    contentMiddle: [
                        new Text({
                            text: this.getText(I18N_KEYS.ERROR_TITLE)
                        })
                    ]
                }),
                afterClose: () => oDialog.destroy()
            });

            oDialog.open();
        }
    });
});