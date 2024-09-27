import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ElementSettings } from "sap/ui/core/Element";

declare module "./ChartItem" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $ChartItemSettings extends $ElementSettings {
        text?: string | PropertyBindingInfo;
        value?: number | PropertyBindingInfo | `{${string}}`;
    }

    export default interface ChartItem {

        // property: text
        getText(): string;
        setText(text: string): this;

        // property: value
        getValue(): number;
        setValue(value: number): this;
    }
}
