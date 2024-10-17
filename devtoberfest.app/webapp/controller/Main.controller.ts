import Table from "sap/m/Table";
import BaseController from "./BaseController";
import Sorter from "sap/ui/model/Sorter";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import { Icon$PressEvent } from "sap/ui/core/Icon";
import { ListItemBase$PressEvent } from "sap/m/ListItemBase";
import Panel from "sap/m/Panel";
import { Button$PressEvent } from "sap/m/Button";
import ODataContextBinding from "sap/ui/model/odata/v4/ODataContextBinding";
import MessageBox from "sap/m/MessageBox";
import DateTimeInput from "sap/m/DateTimeInput";

/**
 * @namespace devtoberfest.app.controller
 */
export default class Main extends BaseController {
	private _booksTable: Table;
	private _bookDetails: Panel;
	onInit(): void {
			this._booksTable = this.byId("booksTable") as Table;
			this._bookDetails = this.byId("bookDetails") as Panel;
			void import("sap/m/Button").then(({ default: Button}) => {
				this._bookDetails.addContent(new Button({
					text: "Don't click me! 😉",
					tap: () => {
						MessageBox.show("Hello Devtoberfest! 👻");
					}
				}));
			});
			const DateTimeInputMD = DateTimeInput.getMetadata();
			console.log(DateTimeInputMD);
	}
	public onBooksSort(event: Icon$PressEvent): void {
			const asc = event.getSource().getSrc() === "sap-icon://sort-ascending";
			const itemsBinding = this._booksTable.getBinding("items") as ODataListBinding;
			itemsBinding.sort(new Sorter("title", asc));
			const control = jQuery(`#${event.getSource().getId()}`).control(0) as Icon;
			control.setSrc(asc ? "sap-icon://sort-descending" : "sap-icon://sort-ascending");
			//event.getSource().setSrc(asc ? "sap-icon://sort-descending" : "sap-icon://sort-ascending");
		}
	public onBookSelect(event: ListItemBase$PressEvent): void {
    const listItem = event.getSource();
    this._bookDetails.setVisible(true);
    this._bookDetails.bindElement(listItem.getBindingContext().getPath());
	}
	public async onBookOrder(event: Button$PressEvent): Promise<void> {
		const oAction = this.getModel().bindContext("/submitOrder(...)") as ODataContextBinding;
		oAction.setParameter("book", event.getSource().getBindingContext().getProperty("ID"));
		oAction.setParameter("quantity", 1);
		try {
				await oAction.invoke();
				this.getModel().refresh();
		} catch (err) {
				MessageBox.error("Failed to order the book.\nReason: " + (err as Error).message);
		}
	}
}
