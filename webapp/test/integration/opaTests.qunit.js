/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["com/company/demo/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
