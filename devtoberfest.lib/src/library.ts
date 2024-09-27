/*!
 * ${copyright}
 */

import Lib from "sap/ui/core/Lib";


// library dependencies must also be imported here
import "sap/ui/core/library";

/**
 * Initialization Code and shared classes of library devtoberfest.lib.
 */

// delegate further initialization of this library to the Core
const thisLib: { [key: string]: unknown } = Lib.init({
	name: "devtoberfest.lib",
	version: "${version}",
	dependencies: [
		// keep in sync with the ui5.yaml and .library files
		"sap.ui.core"
	],
	types: [],
	interfaces: [],
	controls: ["devtoberfest.lib.Chart"],
	elements: ["devtoberfest.lib.ChartItem"],
	noLibraryCSS: true // if no CSS is provided, you can disable the library.css load here
}) as { [key: string]: unknown };

// export the library namespace
export default thisLib;
