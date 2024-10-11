import prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";

import { CSBParameters } from "./Tool";

interface SandpackBundlerFile {
  code: string;
  hidden?: boolean;
  active?: boolean;
  readOnly?: boolean;
}

type SandpackBundlerFiles = Record<string, SandpackBundlerFile>;

function standardizeFilesFormat(
  files: Record<string, string>,
): SandpackBundlerFiles {
  return Object.entries(files).reduce((acc, [key, value]) => {
    if (typeof value === "string") {
      return {
        ...acc,
        [key]: {
          code: value,
        },
      };
    }

    return { ...acc, [key]: value };
  }, {});
}

export function parseImports(
  mapComponent: Record<string, string | true | string[]>,
) {
  let imports = ``;
  for (const [key, value] of Object.entries(mapComponent)) {
    if (Array.isArray(value)) {
      imports += `import { ${value.join(", ")} } from '${key}';\n`;
    } else if (value === true) {
      imports += `import '${key}';\n`;
    } else if (typeof value === "string") {
      imports += `import ${value} from '${key}';\n`;
    }
  }

  return imports;
}

type Props = {
  storySource: string;
  imports: string;
} & CSBParameters;

export function convertSandboxToTemplate(
  props: Props,
): Promise<SandpackBundlerFiles> {
  switch (props.template) {
    case "react":
      return createReactTemplate(props);
    case "angular":
      return createAngularTemplate(props);
    default:
      return;
  }
}

async function createAngularTemplate(
  props: Props,
): Promise<SandpackBundlerFiles> {
  const files = {
    "/src/app/app.component.css": {
      code: `body {
  font-family: sans-serif;
  -webkit-font-smoothing: auto;
  -moz-font-smoothing: auto;
  -moz-osx-font-smoothing: grayscale;
  font-smoothing: auto;
  text-rendering: optimizeLegibility;
  font-smooth: always;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}
h1 {
  font-size: 1.5rem;
}`,
    },
    "/src/app/app.component.html": {
      code: `<div>
<h1>{{ helloWorld }}</h1>
</div>     
`,
    },
    "/src/app/app.component.ts": {
      code: `import { Component } from "@angular/core";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  helloWorld = "Hello world";
}           
`,
    },
    "/src/app/app.module.ts": {
      code: `import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
      
import { AppComponent } from "./app.component";
      
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}       
`,
    },
    "/src/index.html": {
      code: `<!doctype html>
<html lang="en">
      
<head>
  <meta charset="utf-8">
  <title>Angular</title>
  <base href="/">
      
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
      
<body>
   <app-root></app-root>
</body>
      
</html>
`,
    },
    "/src/main.ts": {
      code: `import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
      
import { AppModule } from "./app/app.module";      
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.log(err));
      
`,
    },
    "/src/polyfills.ts": {
      code: `import "core-js/proposals/reflect-metadata";   
      import "zone.js/dist/zone";
`,
    },
    "/package.json": {
      code: JSON.stringify({
        dependencies: {
          "@angular/core": "^11.2.0",
          "@angular/platform-browser": "^11.2.0",
          "@angular/platform-browser-dynamic": "^11.2.0",
          "@angular/common": "^11.2.0",
          "@angular/compiler": "^11.2.0",
          "zone.js": "0.11.3",
          "core-js": "3.8.3",
          rxjs: "6.6.3",
          ...props.dependencies,
        },
        main: "/src/main.ts",
      }),
    },

    ...standardizeFilesFormat(props.files),
  };

  return files;
}

async function createReactTemplate(
  props: Props,
): Promise<SandpackBundlerFiles> {
  const files = {
    "public/index.html": {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    },
    "package.json": {
      code: JSON.stringify(
        {
          dependencies: {
            react: "^18.0.0",
            "react-dom": "^18.0.0",
            "react-scripts": "^5.0.0",
            ...props.dependencies,
          },
          main: "/src/index.js",
        },
        null,
        2,
      ),
    },
    "src/provider.js": {
      code: props.provider,
    },
    "src/index.js": {
      code: `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GenericProvider from "./provider";
import App from "./App";
const root = createRoot(document.getElementById("root"));
root.render(
<StrictMode>
  <GenericProvider>
    <App />
  </GenericProvider>
</StrictMode>
);
`,
    },
    "src/App.js": {
      code: `
${props.imports}
export default App = () => {
return ${props.storySource};
}`,
    },
    ...standardizeFilesFormat(props.files),
  };

  const prettifiedFiles: SandpackBundlerFiles = {};
  const ignoredFileExtension = ["json", "html", "md"];

  for (const [key, value] of Object.entries(files)) {
    if (ignoredFileExtension.includes(key.split(".").pop())) {
      prettifiedFiles[key] = value;

      continue;
    }

    prettifiedFiles[key] = {
      ...value,
      code: await prettier.format(value.code, {
        parser: "babel",
        plugins: [prettierPluginBabel, prettierPluginEstree],
      }),
    };
  }

  return files;
}
