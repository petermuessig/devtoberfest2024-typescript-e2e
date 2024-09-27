import Chart from "devtoberfest/lib/Chart";
import ChartItem from "devtoberfest/lib/ChartItem";

// create a new instance of the Example control and
// place it into the DOM element with the id "content"
new Chart({
	title: "Example Chart",
	items: [
		new ChartItem({ text: "A", value: 10 }),
		new ChartItem({ text: "B", value: 20 }),
		new ChartItem({ text: "C", value: 30 }),
		new ChartItem({ text: "D", value: 40 }),
		new ChartItem({ text: "E", value: 50 }),
	]
}).placeAt("content");
