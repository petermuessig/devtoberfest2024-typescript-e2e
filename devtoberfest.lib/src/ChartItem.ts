/*!
 * ${copyright}
 */
import "./library";
import { MetadataOptions } from "sap/ui/base/ManagedObject";
import UI5Element from "sap/ui/core/Element";

/**
 * Constructor for a new <code>devtoberfest.lib.ChartItem</code> control.
 *
 * Some class description goes here.
 * @extends UI5Element
 *
 * @author Peter Muessig
 * @version ${version}
 *
 * @constructor
 * @public
 * @namespace devtoberfest.lib
 */
export default class ChartItem extends UI5Element {

	static readonly metadata: MetadataOptions = {
		library: "devtoberfest.lib",
		properties: {
			text: {
				type: "string",
				group: "Data",
				defaultValue: null
			},
			value: {
				type: "int",
				group: "Data",
				defaultValue: 0
			}
		}
	};

	// The following three lines were generated and should remain as-is to make TypeScript aware of the constructor signatures
	constructor(idOrSettings?: string | $ChartItemSettings);
	constructor(id?: string, settings?: $ChartItemSettings);
	constructor(id?: string, settings?: $ChartItemSettings) { super(id, settings); }

}
