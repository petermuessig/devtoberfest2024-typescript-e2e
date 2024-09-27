import ChartItem from "devtoberfest/lib/ChartItem";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { AggregationBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";

declare module "./Chart" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $ChartSettings extends $ControlSettings {
        title?: string | PropertyBindingInfo;
        items?: ChartItem[] | ChartItem | AggregationBindingInfo | `{${string}}`;
    }

    export default interface Chart {

        // property: title
        getTitle(): string;
        setTitle(title: string): this;

        // aggregation: items
        getItems(): ChartItem[];
        addItem(items: ChartItem): this;
        insertItem(items: ChartItem, index: number): this;
        removeItem(items: number | string | ChartItem): ChartItem | null;
        removeAllItems(): ChartItem[];
        indexOfItem(items: ChartItem): number;
        destroyItems(): this;
    }
}
