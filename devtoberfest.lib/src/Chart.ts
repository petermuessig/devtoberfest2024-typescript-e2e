/*!
 * ${copyright}
 */
import "./library";
import Control from "sap/ui/core/Control";
import { ChartData, Chart as ChartJS } from "chart.js/auto";
import { MetadataOptions } from "sap/ui/base/ManagedObject";
import ChartRenderer from "./ChartRenderer";

/**
 * Constructor for a new <code>devtoberfest.lib.Chart</code> control.
 *
 * Some class description goes here.
 * @extends Control
 *
 * @author Peter Muessig
 * @version ${version}
 *
 * @constructor
 * @public
 * @namespace devtoberfest.lib
 */
export default class Chart extends Control {

	private chart: ChartJS;

	static readonly metadata: MetadataOptions = {
		library: "devtoberfest.lib",
		properties: {
			title: {
				type: "string",
				group: "Data",
				defaultValue: null
			}
		},
		defaultAggregation: "items",
		aggregations: {
			items: {
				type: "devtoberfest.lib.ChartItem",
				multiple: true
			}
		}
	};

	// The following three lines were generated and should remain as-is to make TypeScript aware of the constructor signatures
	constructor(idOrSettings?: string | $ChartSettings);
	constructor(id?: string, settings?: $ChartSettings);
	constructor(id?: string, settings?: $ChartSettings) { super(id, settings); }

	onAfterRendering() {
		const data = {
			labels: this.getItems().map((item) => item.getText()),
			datasets: [{
				data: this.getItems().map((item) => item.getValue()),
				borderWidth: 1
			}]
		} as unknown as ChartData;
		if (!this.chart) {
			this.chart = new ChartJS(this.getDomRef("canvas") as HTMLCanvasElement, {
				type: 'bar',
				data: data,
				options: {
					responsive: true,
					plugins: {
						legend: {
							display: false
						},
						title: {
							display: true,
							text: this.getTitle()
						}
					}
				},
			});
		} else {
			this.chart.data = data;
			this.chart.update();
		}
	}

	static renderer: typeof ChartRenderer = ChartRenderer;

}
