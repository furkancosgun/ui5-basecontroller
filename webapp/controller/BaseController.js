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
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/Fragment"
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
    Spreadsheet,
    Fragment
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
         * @returns {sap.ui.model.Model} The model instance.
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
         * @param {string} sPath The binding path.
         * @param {string} [sName] The model name.
         * @returns {any} The property value.
         */
        getProperty(sPath, sName) {
            const oModel = this.getModel(sName);
            return oModel?.getProperty(sPath);
        },

        /**
         * Sets a property value in a model.
         * @public
         * @param {string} sPath The binding path.
         * @param {any} vValue The value to set.
         * @param {string} [sName] The model name.
         */
        setProperty(sPath, vValue, sName) {
            const oModel = this.getModel(sName);
            oModel?.setProperty(sPath, vValue);
        },

        /**
         * Gets the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceBundle} The resourceBundle.
         */
        getResourceBundle() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Gets i18n text from the resource bundle.
         * @public
         * @param {string} sKey The i18n text key.
         * @param {Array} [aParams] Optional parameters for the text.
         * @returns {string} The translated text.
         */
        getText(sKey, aParams) {
            return this.getResourceBundle().getText(sKey, aParams);
        },

        /**
         * Navigates to a route with optional parameters.
         * @public
         * @param {string} sRouteName The route name.
         * @param {object} [oParams] The route parameters.
         * @param {object} [oComponentTargetInfo] The component target info.
         */
        navTo(sRouteName, oParams, oComponentTargetInfo) {
            this.getRouter().navTo(sRouteName, oParams, oComponentTargetInfo);
        },

        /**
         * Navigates back in history or to a fallback route.
         * @public
         * @param {string} [sFallbackRoute] The fallback route.
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
         * @param {number} [iDelay] The delay in milliseconds.
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
         * Executes a Promise with busy indicator.
         * @public
         * @param {Promise} oPromise The promise to execute.
         * @returns {Promise} The result of the promise.
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
         * Shows a toast message.
         * @public
         * @param {string} sMessage The message to show.
         */
        showToast(sMessage) {
            MessageToast.show(sMessage);
        },

        /**
         * Shows an error dialog.
         * @public
         * @param {string|Error} vError The error message or object.
         * @param {string} [sTitle] The dialog title.
         * @returns {Promise} Promise that resolves when dialog closes.
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
         * Shows a success dialog.
         * @public
         * @param {string} sMessage The success message.
         * @param {string} [sTitle] The dialog title.
         * @returns {Promise} Promise that resolves when dialog closes.
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
         * Shows an information dialog.
         * @public
         * @param {string} sMessage The information message.
         * @param {string} [sTitle] The dialog title.
         * @returns {Promise} Promise that resolves when dialog closes.
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
         * Shows a warning dialog.
         * @public
         * @param {string} sMessage The warning message.
         * @param {string} [sTitle] The dialog title.
         * @returns {Promise} Promise that resolves when dialog closes.
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
         * Shows a confirmation dialog.
         * @public
         * @param {string} sMessage The confirmation message.
         * @param {string} [sTitle] The dialog title.
         * @returns {Promise<boolean>} Promise that resolves with confirmation result.
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
         * Shows a service error dialog with support for JSON, XML, and raw error responses.
         * @public
         * @param {object} oError The error object from service call.
         */
        showServiceError(oError) {
            // Tüm hata detaylarını debug için logla
            console.error("Service Error Details:", {
                responseText: oError.responseText,
                statusCode: oError.statusCode,
                statusText: oError.statusText,
                message: oError.message,
                fullError: oError
            });

            try {
                let sErrorMessage = this.getText(I18N_KEYS.ERROR_UNKNOWN);

                // 1. JSON Response
                if (oError.responseText?.trim().startsWith('{')) {
                    const oErrorData = JSON.parse(oError.responseText)?.error;
                    if (oErrorData?.innererror?.errordetails) {
                        this._showDetailedServiceError(oErrorData.innererror.errordetails);
                        return;
                    }
                    sErrorMessage = oErrorData?.message?.value || oErrorData?.message || sErrorMessage;
                }
                // 2. XML Response
                else if (oError.responseText?.includes('<?xml') || oError.responseText?.includes('<error>')) {
                    sErrorMessage = this._parseXmlError(oError.responseText) || sErrorMessage;
                }
                // 3. Status Text (HTTP errors)
                else if (oError.statusText && oError.statusText !== "HTTP request failed") {
                    sErrorMessage = `${oError.statusCode}: ${oError.statusText}`;
                }
                // 4. Direct message
                else if (oError.message && oError.message !== "HTTP request failed") {
                    sErrorMessage = oError.message;
                }
                // 5. Fallback to status code only
                else if (oError.statusCode) {
                    sErrorMessage = `HTTP Error ${oError.statusCode}`;
                }

                MessageBox.error(sErrorMessage);

            } catch (e) {
                console.error("Error processing service error:", e);
                MessageBox.error(this.getText(I18N_KEYS.ERROR_UNKNOWN));
            }
        },
        /**
         * Parses XML error response to extract error message.
         * @private
         * @param {string} sXmlResponse The XML response string.
         * @returns {string|null} The extracted error message or null.
         */
        _parseXmlError(sXmlResponse) {
            try {
                // Method 1: Simple regex for <message> tag
                const sMessageMatch = sXmlResponse.match(/<message[^>]*>([^<]+)<\/message>/i);
                if (sMessageMatch && sMessageMatch[1]) {
                    return sMessageMatch[1].trim();
                }

                // Method 2: Regex for any text between <error> tags
                const sErrorMatch = sXmlResponse.match(/<error[^>]*>([\s\S]*?)<\/error>/i);
                if (sErrorMatch && sErrorMatch[1]) {
                    const sErrorContent = sErrorMatch[1].replace(/<[^>]+>/g, '').trim();
                    if (sErrorContent) return sErrorContent;
                }

                // Method 3: Try DOMParser if available
                if (typeof DOMParser !== 'undefined') {
                    try {
                        const oParser = new DOMParser();
                        const oXmlDoc = oParser.parseFromString(sXmlResponse, "text/xml");
                        const oMessageElement = oXmlDoc.getElementsByTagName("message")[0];
                        if (oMessageElement) {
                            return oMessageElement.textContent.trim();
                        }
                    } catch (e) {
                        console.warn("DOMParser failed, using fallback methods");
                    }
                }

                console.warn("Could not parse XML error response:", sXmlResponse);
                return null;

            } catch (e) {
                console.error("XML parsing error:", e);
                return null;
            }
        },

        // =================================================================
        // ODATA / SERVICE UTILITIES
        // =================================================================

        /**
         * Executes a Promise-based OData service call.
         * @public
         * @param {string|"read" | "create" | "update" | "remove"} sMethod The OData method.
         * @param {string} sPath The EntitySet path.
         * @param {object} [oArgs] Additional OData parameters.
         * @returns {Promise} Promise with operation result.
         */
        callService(sMethod, sPath, oArgs) {
            const oModel = this.getOwnerComponent().getModel();
            if (!oModel || typeof oModel[sMethod] !== "function") {
                return Promise.reject(new Error(`OData method '${sMethod}' not found.`));
            }

            return new Promise((resolve, reject) => {
                const aArgs = [sPath];

                if (oArgs && (sMethod === "create" || sMethod === "update")) {
                    aArgs.push(oArgs);
                }

                const oParams = {
                    ...(sMethod === "read" || sMethod === "callFunction" ? oArgs : {}),
                    success: (oData) => {
                        resolve(sMethod === "read" || sMethod == "callFunction" ? (oData.results || oData) : oData);
                    },
                    error: reject
                };

                aArgs.push(oParams);
                oModel[sMethod].apply(oModel, aArgs);
            });
        },

        /**
         * Creates a URI path for an OData entity.
         * @public
         * @param {string} sEntitySet The EntitySet name.
         * @param {object} oKeyObject The key properties.
         * @returns {string} The URI path for the entity.
         */
        createEntityKey(sEntitySet, oKeyObject) {
            const oModel = this.getOwnerComponent().getModel();
            return oModel.createKey(sEntitySet, oKeyObject);
        },

        // =================================================================
        // LOCAL STORAGE UTILITIES
        // =================================================================

        /**
         * Saves data to local storage.
         * @public
         * @param {string} sKey The storage key.
         * @param {any} vValue The data to store.
         */
        saveToLocalStorage(sKey, vValue) {
            if (!sKey || vValue === undefined) return;

            const oStorage = Storage.get(Storage.Type.local);
            oStorage.put(sKey, JSON.stringify(vValue));
        },

        /**
         * Retrieves data from local storage.
         * @public
         * @param {string} sKey The storage key.
         * @returns {any} The retrieved data.
         */
        loadFromLocalStorage(sKey) {
            const oStorage = Storage.get(Storage.Type.local);
            const sValue = oStorage.get(sKey);

            try {
                return sValue ? JSON.parse(sValue) : null;
            } catch (oError) {
                return null;
            }
        },

        // =================================================================
        // FRAGMENT / DIALOGS
        // =================================================================

        /**
         * Loads an XML Fragment asynchronously.
         * @public
         * @param {object} oOptions Configuration options.
         * @param {string} oOptions.sName The fragment name.
         * @param {sap.ui.core.mvc.Controller} [oOptions.oController] The controller.
         * @param {boolean} [oOptions.bOpenAsDialog] Open as dialog.
         * @param {boolean} [oOptions.bAddAsDependent] Add as dependent.
         * @returns {Promise} Promise with fragment instance.
         */
        async loadAsyncFragment(oOptions) {
            const {
                sName,
                oController = this,
                bOpenAsDialog = false,
                bAddAsDependent = false
            } = oOptions;

            if (!sName) {
                throw new Error("Fragment name is required.");
            }

            const oFragment = await this._loadFragment(sName, oController);

            if (bAddAsDependent) {
                this.getView().addDependent(oFragment);
            }

            if (bOpenAsDialog && typeof oFragment.open === "function") {
                oFragment.open();
            }

            return oFragment;
        },

        /**
         * Opens a dynamic SelectDialog.
         * @public
         * @param {object} oOptions Configuration options.
         * @returns {Promise} Promise with selected items.
         */
        openDynamicSelectDialog(oOptions) {
            return new Promise((resolve) => {
                const {
                    aData,
                    oMapping = {
                        title: "{title}",
                        description: "{description}"
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
                        const aFilters = aSearchFields.map(sField =>
                            new Filter(sField, FilterOperator.Contains, sValue)
                        );
                        const oFilter = new Filter({
                            filters: aFilters,
                            or: true
                        });
                        oSelectDialog.getBinding("items").filter(sValue ? [oFilter] : []);
                    },
                    confirm: (oEvent) => {
                        const aSelectedItems = oEvent.getParameter("selectedItems");
                        const aSelectedObjects = aSelectedItems.map(oItem =>
                            oItem.getBindingContext().getObject()
                        );
                        const vResult = bMultiSelect ? aSelectedObjects : (aSelectedObjects[0] || null);
                        oSelectDialog.destroy();
                        resolve(vResult);
                    },
                    cancel: () => {
                        oSelectDialog.destroy();
                        resolve(null);
                    }
                });

                oSelectDialog.setModel(oModel);
                oSelectDialog.open("");
            });
        },

        /**
         * Opens a digital signature dialog.
         * @public
         * @param {object} [oOptions] Configuration options.
         * @returns {Promise} Promise with signature data.
         */
        openDigitalSignatureDialog(oOptions = {}) {
            return new Promise((resolve) => {
                const {
                    title = this.getText(I18N_KEYS.DIGITAL_SIGNATURE_TITLE),
                        width = 350,
                        height = 350,
                        lineWidth = 2,
                        strokeStyle = "#000000"
                } = oOptions;

                const sHtmlContent = `
                    <canvas id="signatureCanvas" width="${width}" height="${height}" 
                            style="border:1px solid #000; background-color: #fff; touch-action: none;">
                    </canvas>
                `;

                const oHtml = new HTML({
                    content: sHtmlContent,
                    afterRendering: () => {
                        const oCanvas = document.getElementById("signatureCanvas");
                        if (!oCanvas) return;

                        const oCtx = oCanvas.getContext("2d");
                        let bDrawing = false;
                        let iLastX = 0;
                        let iLastY = 0;

                        oCtx.lineWidth = lineWidth;
                        oCtx.lineCap = "round";
                        oCtx.strokeStyle = strokeStyle;
                        oCtx.fillStyle = "#fff";
                        oCtx.fillRect(0, 0, oCanvas.width, oCanvas.height);

                        const getCoords = (oEvent) => {
                            if (oEvent.touches?.length > 0) {
                                const oTouch = oEvent.touches[0];
                                const oRect = oCanvas.getBoundingClientRect();
                                return {
                                    offsetX: oTouch.clientX - oRect.left,
                                    offsetY: oTouch.clientY - oRect.top
                                };
                            }
                            return {
                                offsetX: oEvent.offsetX,
                                offsetY: oEvent.offsetY
                            };
                        };

                        const draw = (oEvent) => {
                            if (!bDrawing) return;
                            const {
                                offsetX,
                                offsetY
                            } = getCoords(oEvent);
                            oCtx.beginPath();
                            oCtx.moveTo(iLastX, iLastY);
                            oCtx.lineTo(offsetX, offsetY);
                            oCtx.stroke();
                            [iLastX, iLastY] = [offsetX, offsetY];
                        };

                        const startDrawing = (oEvent) => {
                            bDrawing = true;
                            const {
                                offsetX,
                                offsetY
                            } = getCoords(oEvent);
                            [iLastX, iLastY] = [offsetX, offsetY];
                        };

                        const stopDrawing = () => {
                            bDrawing = false;
                        };

                        // Mouse events
                        oCanvas.addEventListener("mousedown", startDrawing);
                        oCanvas.addEventListener("mousemove", draw);
                        oCanvas.addEventListener("mouseup", stopDrawing);
                        oCanvas.addEventListener("mouseout", stopDrawing);

                        // Touch events
                        oCanvas.addEventListener("touchstart", (oEvent) => {
                            oEvent.preventDefault();
                            startDrawing(oEvent);
                        }, {
                            passive: false
                        });

                        oCanvas.addEventListener("touchmove", (oEvent) => {
                            oEvent.preventDefault();
                            draw(oEvent);
                        }, {
                            passive: false
                        });

                        oCanvas.addEventListener("touchend", stopDrawing);
                    }
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
                                                const oCanvas = document.getElementById("signatureCanvas");
                                                if (oCanvas) {
                                                    const oCtx = oCanvas.getContext("2d");
                                                    oCtx.clearRect(0, 0, oCanvas.width, oCanvas.height);
                                                    oCtx.fillStyle = "#fff";
                                                    oCtx.fillRect(0, 0, oCanvas.width, oCanvas.height);
                                                }
                                            }
                                        }),
                                        new Button({
                                            text: this.getText(I18N_KEYS.DIGITAL_SIGNATURE_SAVE),
                                            type: "Emphasized",
                                            press: () => {
                                                const oCanvas = document.getElementById("signatureCanvas");
                                                if (oCanvas) {
                                                    const sDataUrl = oCanvas.toDataURL("image/jpeg");
                                                    oDialog.close();
                                                    resolve(sDataUrl);
                                                }
                                            }
                                        }).addStyleClass("sapUiSmallMarginBegin")
                                    ]
                                }).addStyleClass("sapUiSmallMarginTop")
                            ]
                        }).addStyleClass("sapUiTinyMargin")
                    ],
                    endButton: new Button({
                        text: this.getText(I18N_KEYS.DIGITAL_SIGNATURE_CANCEL),
                        press: () => {
                            oDialog.close();
                            resolve(null);
                        }
                    }),
                    afterClose: () => oDialog.destroy()
                });

                oDialog.open();
            });
        },

        // =================================================================
        // EXPORT UTILITIES
        // =================================================================

        /**
         * Exports table data to Excel.
         * @public
         * @param {string|sap.ui.table.Table|sap.m.Table} vTable The table control.
         * @param {string} [sFileName] The file name.
         * @returns {Promise} Promise when export completes.
         */
        async exportTableToExcel(vTable, sFileName = "Export") {
            const oTable = typeof vTable === "string" ? this.getView().byId(vTable) : vTable;
            if (!oTable) return;

            const aColumns = oTable.getColumns()
                .map(oColumn => {
                    const oColumnData = oColumn.data();
                    const sProperty = oColumnData["export.property"];
                    return sProperty ? {
                        label: oColumnData["export.label"],
                        property: sProperty,
                        type: oColumnData["export.type"]
                    } : null;
                })
                .filter(oColumn => oColumn !== null);

            const oDataSource = oTable.getBinding("items") || oTable.getBinding("rows");
            if (!oDataSource) return;

            const oSpreadsheet = new Spreadsheet({
                workbook: {
                    columns: aColumns
                },
                dataSource: oDataSource,
                fileName: sFileName,
                worker: false
            });

            await oSpreadsheet.build();
            oSpreadsheet.destroy();
        },

        // =================================================================
        // PRIVATE UTILITIES
        // =================================================================

        /**
         * Internal method to load fragment.
         * @private
         * @param {string} sName Fragment name.
         * @param {sap.ui.core.mvc.Controller} oController Controller instance.
         * @returns {Promise<sap.ui.core.Element>} Fragment instance.
         */
        async _loadFragment(sName, oController) {
            if (typeof this.loadFragment === "function") {
                return await this.loadFragment({
                    name: sName,
                    controller: oController
                });
            }
            return await Fragment.load({
                name: sName,
                controller: oController
            });
        },

        /**
         * Converts service error type to UI5 MessageType.
         * @private
         * @param {string} sType The error type.
         * @returns {string} The UI5 MessageType.
         */
        _serviceTypeToUI5MessageType(sType) {
            const sNormalizedType = sType?.toLowerCase();
            switch (sNormalizedType) {
                case "info":
                    return "Information";
                default:
                    return sNormalizedType?.charAt(0).toUpperCase() + sNormalizedType?.slice(1) || "Error";
            }
        },

        /**
         * Shows detailed service errors.
         * @private
         * @param {Array} aErrorDetails The error details.
         */
        _showDetailedServiceError(aErrorDetails) {
            const aMessageItems = aErrorDetails.map(oDetail => ({
                type: this._serviceTypeToUI5MessageType(oDetail.severity),
                title: this._serviceTypeToUI5MessageType(oDetail.severity),
                subtitle: oDetail.message,
                description: oDetail.message
            }));

            const oMessageView = new MessageView({
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
