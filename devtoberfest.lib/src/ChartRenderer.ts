/*!
 * ${copyright}
 */
import RenderManager from "sap/ui/core/RenderManager";
import Chart from "./Chart";

/**
 * Chart renderer.
 */
export default {
	apiVersion: 2, // usage of DOM Patcher

	/**
	 * Renders the HTML for the given control, using the provided {@link RenderManager}.
	 *
	 * @param rm The reference to the <code>sap.ui.core.RenderManager</code>
	 * @param control The control instance to be rendered
	 */
	render: function (rm: RenderManager, control: Chart) {
		rm.openStart("div", control);
		rm.style("padding", "2em");
		rm.openEnd();

		rm.openStart("canvas", control.getId() + "-canvas");
		rm.openEnd();
		rm.close("canvas");

		rm.close("div");
	}
};
