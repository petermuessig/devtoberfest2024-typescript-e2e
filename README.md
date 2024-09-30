# TypeScript E2E Development – from zero to hero in 1hr!

This repository is a step-by-step guide explaining how to build a UI5 freestyle bookshop application on top of the booskop CAP server from the [Cloud CAP Samples](https://github.com/SAP-samples/cloud-cap-samples) project.

The recorded session with a live-walkthrough can be found on YouTube: [🟠 UI5 Freestyle: TypeScript E2E Development - from zero to hero in 1hr!](https://www.youtube.com/watch?v=7aAehB4ejHQ).

## Preparation

Make sure to have a current supported version of [Node.js](https://nodejs.org/) installed, and a modern JavaScript IDE such as [VSCode](https://code.visualstudio.com/) or use a hosted IDE such as [SAP Business Application Studio](https://www.sap.com/products/technology-platform/business-application-studio.html).

To create projects, install [Yeoman](https://yeoman.io/) and [Easy-UI5](https://github.com/SAP/generator-easy-ui5) globally to your Node.js environment:

```sh
npm install -g yo generator-easy-ui5
```

To run the CAP server locally, you should also install the CAP SDK globally:

```sh
npm install -g @sap/cds-dk
```

Interested in more details about CAP, just got [here...](https://cap.cloud.sap/docs/).

## Step 1: Prepare the bookshop server

Download the ZIP of the [Cloud CAP Samples](https://github.com/SAP-samples/cloud-cap-samples) repository:

* Direct link to zip: https://github.com/SAP-samples/cloud-cap-samples/archive/refs/heads/main.zip
* Unpack the archive and copy the `bookshop` directory into your projects' root directory

Your folder structure should look like that now:

```sh
<root>
└── bookshop
```

To make the bookshop server usable, you need to run `npm install` in the `bookshop` directory.

Now you can test the `bookshop` server by running `npm start` and open the welcome page [http://localhost:4004](http://localhost:4004).

It has already a bookshop application based on [Vue.js](https://vuejs.org/) built-in - but we prefer [OpenUI5](https://sdk.openui5.org/)/[SAPUI5](https://ui5.sap.com/) to build our application! :wink:

Let's stop the server again and proceed...

## Step 2: Create the UI5 application

To create the UI5 application, we are using [Easy-UI5](https://github.com/SAP/generator-easy-ui5) with the available [community templates](https://github.com/ui5-community?q=generator-ui5&type=all&language=&sort=). For application development in TypeScript, we are using the `ts-app` template. Run the following command in your project root:

```sh
yo easy-ui5 ts-app
```

Answer the questions (just set the namespace to `devtoberfest.app`, for the rest use the defaults) but skip the Git initializiation of the repository.

Your folder structure should look like that now:

```sh
<root>
├── bookshop
└── devtoberfest.app
```

The project is fully created and you can run the following commands in the project:

```sh
# running the devserver
npm start
npm run start-cdn # load UI5 from CDN

# building the project (create the dist)
npm run build

# start from dist
npm run start:dist
npm run start:dist-cdn # load UI5 from CDN

# testing the project:
#   - executs lint
#   - functional and integration tests + code coverage
npm test
npm run karma # test-driven development

# system tests (requires the app to run already)
npm run wdi5

# type checking
npm run ts-typecheck
```

The source code of the project is completely written in TypeScript. The `package.json` includes the types, the `tsconfig.json` contains the configuration for Typescript and the `ui5.yaml` is using the `ui5-tooling-transpile` to transpile the project back into JavaScript.

In your IDE you will notice code completion support, lint checks ([ESLint](https://eslint.org/docs/latest/use/getting-started) and [TypeScript](https://www.typescriptlang.org/)), Quick Fixes support, and some specialities for UI5: ES modules and ES classes are used in TypeScript + JSDoc tags is needed as instructions for the transpiler regarding the namespace. The GitHub project [SAP-samples/ui5-typescript-tutorial](https://github.com/SAP-samples/ui5-typescript-tutorial) explains all that in depth.

## Step 3: Connect the bookshop server with your app

Due to CORS, the bookshop server can't be used remotely. The most familar option to integrate the bookshop server is using a proxy. But for CAP an easier option is available: [`ui5-middleware-cap`](https://www.npmjs.com/package/ui5-middleware-cap).

Install the middleware in your app as a `devDependency`:

```sh
npm i -D ui5-middleware-cap
```

Add the bookshop server as `devDependency`:

```sh
npm i -D @capire/bookshop@../bookshop
```

Configure the middleware in your `ui5.yaml`:

```yaml
specVersion: "4.0"
metadata:
  name: devtoberfest.app
type: application
[...]
server:
  customMiddleware:
    - name: ui5-middleware-cap
      afterMiddleware: compression
```

If you run your devserver now with `npm start` you will see that also the CAP server is starting up in the log. The services will be available under the umbrella of the UI5 devserver, e.g.:

  * books service: http://localhost:8080/browse/$metadata
  * user service: http://localhost:8080/user/$metadata

We are ready to consume the services in our UI5 application.

## Step 4: Use the bookshop service

Open the `manifest.json` of the application and add the following entries:

```json
{
    "sap.app": {
        [...]
        "dataSources": {
            "bookshop": {
                "uri": "/browse/",
                "type": "OData",
                "settings": {
                    "odataVersion": "4.0"
                }
            }
        }
    [...]

    "sap.ui5": {
        [...]
        "models": {
            "": {
                "dataSource": "bookshop",
                "preload": true,
                "settings": {
                    "groupId": "$auto",
                    "synchronizationMode": "None",
                    "operationMode": "Server",
                    "autoExpandSelect": true
                }
            },
    [...]
}
```

## Step 5: Display the books in a table

In the `Main.view.xml` add the `sap.m.Table` control:

```xml
<Table id="booksTable" items='{/Books}'>
    <columns>
        <Column>
            <Text text="Book" />
        </Column>
        <Column>
            <Text text="Author" />
        </Column>
        <Column>
            <Text text="Genre" />
        </Column>
        <Column>
            <Text text="Price" />
        </Column>
        <Column>
            <Text text="Stock" />
        </Column>
    </columns>
    <items>
        <ColumnListItem vAlign="Middle" type="Active">
            <cells>
                <ObjectIdentifier title="{title}" />
                <Text text="{author}" />
                <Text text="{genre/name}" />
                <ObjectNumber number="{price}" unit="{currency_code}" />
                <ObjectStatus text="{stock}" state="{=
                    ${stock} >= 20 ? 'Success' : ${stock} > 0 ? 'Warning' : 'Error'
                }" />
            </cells>
        </ColumnListItem>
    </items>
</Table>
```

## Step 6: Add "primitive" Sorting

In the `Main.view.xml` add the following to the books cell:

```xml
<HBox>
    <Text text="Book" />
    <core:Icon src="sap-icon://sort-ascending" class="sapUiSmallMarginBegin" press=".onBooksSort" />
</HBox>
```

> Hint: [CSS Margin Classes](https://sapui5.hana.ondemand.com/#/topic/777168ffe8324873973151dae2356d1c) to position controls

adopt the binding of the books to sort ascending by default:

```xml
<Table id="booksTable" items='{
    path: "/Books",
    sorter: {
        "path": "title",
        "ascending": "true"
    }
}'/>
```

In the `Main.controller.ts`, add the following code:

```ts
export default class Main extends BaseController {
    private _booksTable: Table;
    onInit(): void {
        this._booksTable = this.byId("booksTable") as Table;
    }
    public onBooksSort(event: Icon$PressEvent): void {
        const asc = event.getSource().getSrc() === "sap-icon://sort-ascending";
        const itemsBinding = this._booksTable.getBinding("items") as ODataListBinding;
        itemsBinding.sort(new Sorter("title", asc));
        event.getSource().setSrc(asc ? "sap-icon://sort-descending" : "sap-icon://sort-ascending");
    }
}
```

## Step 7: Book details

In the `Main.view.xml` add the following code below the table:

```xml
<Panel id="bookDetails" headerText="Details" visible="false" class="sapUiSmallMarginTop" >
    <VBox>
        <Label text="Title" />
        <Text text="{title}" />
        <Label text="Description" class="sapUiSmallMarginTop" />
        <Text text="{descr}" />
    </VBox>
</Panel>
```

and add a press handler to the `ColumnListItem`:

```xml
<ColumnListItem vAlign="Middle" type="Active" press=".onBookSelect">
```

In the `Main.controller.js` add the following event handler to display the book details:

```ts
public onBookSelect(event: ListItemBase$PressEvent): void {
    const listItem = event.getSource();
    this._bookDetails.setVisible(true);
    this._bookDetails.bindElement(listItem.getBindingContext().getPath());
}
```

and extend the `onInit` callback to also store the reference to the book details `Panel`:

```ts
    private _booksTable: Table;
    private _bookDetails: Panel;
    onInit(): void {
            this._booksTable = this.byId("booksTable") as Table;
            this._bookDetails = this.byId("bookDetails") as Panel;
    }
```

## Step 8: Order books (Bonus: Deferred Action Binding)

**Login Action**

Add the `user` model to the `manifest.json`:

```json
{
    "sap.app": {
        [...]
        "dataSources": {
            [...]
            "user": {
                "uri": "/user/",
                "type": "OData",
                "settings": {
                    "odataVersion": "4.0"
                }
            }
        }
    [...]

    "sap.ui5": {
        [...]
        "models": {
            [...]
            "user": {
                "dataSource": "user",
                "preload": true,
                "settings": {
                    "groupId": "$direct",
                    "synchronizationMode": "None",
                    "operationMode": "Server"
                }
            },
    [...]
}
```

> Hint: we use `$direct` to disable the batch request for the login operation.

In the `Component.ts` init lifecycle method we add the login handling using [Deferred Action Binding](https://sapui5.hana.ondemand.com/sdk/#/topic/b54f7895b7594c61a83fa7257fa9d13f).

```ts
public init(): void {
    // call the base component's init function
    super.init();

    [...]

    // login via Deferred Action Binding
    const oLoginAction = this.getModel("user").bindContext("/login(...)") as ODataContextBinding;
    oLoginAction.invoke().then(() => {
        this.getModel("user").refresh();
    }).catch((err) => {
        MessageBox.error("Failed to login.\nReason: " + err);
    });
}
```

In the `Main.view.xml` we want to display the user using expression binding syntax:

```xml
<Page title="{i18n>appTitle} (User: {= ${user>/me/id} || 'anonymous'})" ... />
```

Important is that you must not use async function for lifecycle methods as described in the [ECMAScript Support in the Demo Kit](https://sapui5.hana.ondemand.com/sdk/#/topic/0cb44d7a147640a0890cefa5fd7c7f8e).

Verify the basic auth login in a new incognito window.

**Order Books**

In the `Main.view.xml` add an order button to the book details panel in the `VBox` after the description:

```xml
<Button text="Order" press=".onBookOrder" class="sapUiSmallMarginTop"  />
```

In the `Main.controller.ts` we add the event handler to trigger the order:

```ts
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
```

## Step 9: Create a Library

To create the UI5 library, we are using [Easy-UI5](https://github.com/SAP/generator-easy-ui5) with the available [community templates](https://github.com/ui5-community?q=generator-ui5&type=all&language=&sort=). For application development in TypeScript, we are using the `ts-app` template. Run the following command in your project root:

```sh
yo easy-ui5 ts-library
```

Answer the questions (just set the namespace to `devtoberfest.lib`, for the rest use the defaults) but skip the Git initializiation of the repository.

Your folder structure should look like that now:

```sh
<root>
├── bookshop
├── devtoberfest.app
└── devtoberfest.lib
```

Similar like the UI5 application in TypeScript, the library contains many scripts.

## Step 10: Integrate Chart.js

To integrate thirdparty libraries and benefit from TypeScript, just install them as dependencies. The tooling extension [`ui5-tooling-modules`](https://www.npmjs.com/package/ui5-tooling-modules) enhances the UI5 tooling to easily consume NPM packages in UI5.

> Hint: the NPM packages must be dependent on Node.js!

Install the `ui5-tooling-modules` tooling extension as `devDependency`:

```sh
npm i -D ui5-tooling-modules
```

In the `ui5.yaml` we configure the middleware and the task:

```yaml
specVersion: "4.0"
metadata:
  name: devtoberfest.lib
type: library
[...]
builder:
  customTasks:
    - name: ui5-tooling-modules-task
      afterTask: replaceVersion
    [...]
server:
  customMiddleware:
    - name: ui5-tooling-modules-middleware
      afterMiddleware: compression
    [...]
```

Install the dependencies to [Chart.js](https://www.chartjs.org/):

```sh
# Install chart.js as dependency (so that it can be found by ui5-tooling-modules)
npm i chart.js

# Install the types as devDependency
npm i -D @types/chart.js
```

Now we can start the app and consume the chart.js as UI5 AMD-like module!

You can see the result by opening the chart.js/auto module via: http://localhost:8080/resources/chart.js/auto.js

## Step 11: Create the Chart control

Add `Chart.ts` into the `src` folder:

```ts
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
 * @author You
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
```

Add the `ChartRenderer.ts` to the `src` folder:

```ts
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
```

Add the `ChartItem.ts` to the `src` folder:

```ts
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

}
```

Remove the `Example*.ts` controls and modify the `library.ts`:

```ts
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
```

We remove all references to `Example` and add the `Chart*` classes and enable the option `noLibraryCSS` plus deleting the themes folder as we do not need theming support for the chart.

Finally, we adopt the test page - therefore rename the `Example.html` to `Chart.html` and put the following content inside:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Test Page for devtoberfest.lib.Chart</title>
        <base href="../../../" />
        <script
            src="resources/sap-ui-core.js"
            id="sap-ui-bootstrap"
            data-sap-ui-async="true"
            data-sap-ui-oninit="module:local/Chart"
            data-sap-ui-libs="sap.ui.core,devtoberfest.lib"
            data-sap-ui-theme="sap_horizon"
            data-sap-ui-resourceroots='{"local" : "./test-resources/devtoberfest/lib/"}'
        ></script>
    </head>
    <body class="sapUiBody">
        <h1 id="header">Test Page for <code>devtoberfest.lib.Chart</code></h1>
        <div id="content"></div>
    </body>
</html>
```

The same for the `Example.ts` next to the `Chart.html`, rename it to `Chart.ts` and put the following content inside:

```ts
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
```

Last thing is to adopt the package.json to open the `Chart.html` instead of the `Example.html`, modify the start script like that:

```json
"start": "ui5 serve -o test-resources/devtoberfest/lib/Chart.html",
```

Now you can run the custom Chart control in your library project. The interfaces for the controls will be generated and the constructor code as suggested in the console must be added!

Hint: Excluding the library in the preload build (add to the `ui5.yaml the following):

```yaml
builder:
  libraryPreload:
    excludes:
      - "devtoberfest/lib/thirdparty/"
```

## Step 12: Connecting the app and the lib

Before you connect the app and the library, make sure that you have built the library project once so that the types exist. Run in the library project the following command:

```sh
npm run build
```

Let's connect the app with the library. In the app project install the lib as dependency:

```sh
npm i devtoberfest.lib@../devtoberfest.lib
```

Important next step is to add the library in the `tsconfig.json` as a type:

```json
"types": ["@openui5/types", "@types/qunit", "devtoberfest.lib"],
```

This tells the `ui5-tooling-transpile` that this dependency must be transpiled during development.

Now we can integrate the chart, in the `Main.view.xml`, we add the following code to the View XML tag to define the namespace mapping for the library:

```xml
xmlns:dtlib="devtoberfest.lib"
```

And then we can add the chart control:

```xml
<dtlib:Chart title="Stock" items="{/Books}">
    <dtlib:ChartItem text="{title}" value="{stock}"></dtlib:ChartItem>
</dtlib:Chart>
```

Oh, doesn't work, we need to add the `ui5-tooling-modules` as a middleware to the project:

```sh
npm i -D ui5-tooling-modules
```

and register it in the `ui5.yaml`:

```yaml
specVersion: "4.0"
metadata:
  name: devtoberfest.app
type: application
[...]
server:
  customMiddleware:
    - name: ui5-tooling-modules-middleware
      afterMiddleware: compression
    [...]
```

Now the chart.js is loaded there!

## Step 14: Building the app and packaging the lib

```yaml
specVersion: "4.0"
metadata:
  name: devtoberfest.app
type: application
[...]
builder:
  settings:
    includeDependency:
      - devtoberfest.lib
    [...]
```

This adds the library to the dist folder of the application and it can be deployed together which is useful for some standalone scenarios.

## Step 15: Testing

To be continued...

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/petermuessig/devtoberfest2024-typescript-e2e/issues). Contribution and feedback are encouraged and always welcome.

## License

This work is [licensed](LICENSE) under Apache 2.0.
