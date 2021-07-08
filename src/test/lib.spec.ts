import { Tree } from "@angular-devkit/schematics";
import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";
import {
  Schema as ApplicationOptions,
  Style,
} from "@schematics/angular/application/schema";
import { Schema as WorkspaceOptions } from "@schematics/angular/workspace/schema";
import * as path from "path";
import { Schema as CreateSchematicsOptions } from "../lib/create-schematics/schema";
import { Schema } from "../lib/schema";

const collectionPath = path.join(__dirname, "../collection.json");

const schematicRunner = new SchematicTestRunner(
  "@ngneat/lib",
  require.resolve(collectionPath)
);

const workspaceOptions: WorkspaceOptions = {
  name: "workspace",
  newProjectRoot: "projects",
  version: "6.0.0",
};

const scopeWithName = "@scope/toaster";

const appOptions: ApplicationOptions = {
  name: "bar",
  inlineStyle: false,
  inlineTemplate: false,
  routing: false,
  style: Style.Css,
  skipTests: false,
  skipPackageJson: false,
};

const defaultOptions: Schema = {
  name: scopeWithName,
  ci: "github-actions",
  skipAngularCliGhPages: true,
  skipSpectator: true,
  skipSchematics: false,
  skipPrompts: true,
  importModule: true,
  importStatement: "ToastModule.forRoot()",
  packages: [],
};

const defaultCreateSchematicsOptions: CreateSchematicsOptions = {
  name: scopeWithName,
  skipPrompts: true,
  importModule: true,
  importStatement: "ToastModule.forRoot()",
  packages: [],
};

const schematicResultFiles = [
  "/projects/scope/toaster/tsconfig.schematics.json",
  "/projects/scope/toaster/schematics/collection.json",
  "/projects/scope/toaster/schematics/ng-add/index.ts",
  "/projects/scope/toaster/schematics/ng-add/schema.json",
  "/projects/scope/toaster/schematics/ng-add/schema.ts",
  "/projects/scope/toaster/schematics/ng-add/utils/index.ts",
  "/projects/scope/toaster/schematics/ng-add/utils/ng-module-imports.ts",
  "/projects/scope/toaster/schematics/ng-add/utils/project-main-file.ts",
  "/projects/scope/toaster/schematics/ng-add/utils/project-targets.ts",
];

const libWOSchematicsResultFiles = [
  "/projects/scope/toaster/karma.conf.js",
  "/projects/scope/toaster/ng-package.json",
  "/projects/scope/toaster/package.json",
  "/projects/scope/toaster/README.md",
  "/projects/scope/toaster/tsconfig.lib.json",
  "/projects/scope/toaster/tsconfig.lib.prod.json",
  "/projects/scope/toaster/tsconfig.spec.json",
  "/projects/scope/toaster/src/test.ts",
  "/projects/scope/toaster/src/public-api.ts",
  "/projects/scope/toaster/src/lib/toaster.module.ts",
  "/.all-contributorsrc",
  "/.prettierrc.json",
  "/.releaserc.json",
  "/CODE_OF_CONDUCT.md",
  "/commitlint.config.js",
  "/CONTRIBUTING.md",
  "/LICENSE",
  "/logo.svg",
  "/hooks/pre-commit.js",
  "/.github/ISSUE_TEMPLATE/ISSUE_TEMPLATE.yml",
  "/.github/PULL_REQUEST_TEMPLATE.md",
  "/.github/workflows/release.yml",
  "/.github/workflows/deploy.yml",
];

const resultFiles = [...libWOSchematicsResultFiles, ...schematicResultFiles];

describe("ng-add", () => {
  describe("with project", () => {
    let appTree: UnitTestTree;

    beforeEach(async () => {
      appTree = await schematicRunner
        .runExternalSchematicAsync(
          "@schematics/angular",
          "workspace",
          workspaceOptions
        )
        .toPromise();
      appTree = await schematicRunner
        .runExternalSchematicAsync(
          "@schematics/angular",
          "application",
          appOptions,
          appTree
        )
        .toPromise();
    });

    it("works", async () => {
      const options: Schema = { ...defaultOptions };
      const tree: UnitTestTree = await schematicRunner
        .runSchematicAsync("ng-add", options, appTree)
        .toPromise();

      expect(tree.files).toEqual(expect.arrayContaining(resultFiles));
    });

    it("works with skipLib=true for existing created lib", async () => {
      const appTreeWithLib = await schematicRunner
        .runExternalSchematicAsync(
          "@schematics/angular",
          "library",
          { name: scopeWithName },
          appTree
        )
        .toPromise();

      const options: Schema = { ...defaultOptions, skipLib: true };
      const tree: UnitTestTree = await schematicRunner
        .runSchematicAsync("ng-add", options, appTreeWithLib)
        .toPromise();

      expect(tree.files).toEqual(expect.arrayContaining(resultFiles));
    });

    it("works with skipSchematics=true", async () => {
      const options: Schema = { ...defaultOptions, skipSchematics: true };
      const tree: UnitTestTree = await schematicRunner
        .runSchematicAsync("ng-add", options, appTree)
        .toPromise();

      expect(tree.files).toEqual(
        expect.arrayContaining(libWOSchematicsResultFiles)
      );
      expect(tree.files).not.toEqual(
        expect.arrayContaining(schematicResultFiles)
      );
    });

    it("fails with missing tree", (done) => {
      schematicRunner
        .runSchematicAsync(
          "ng-add",
          {
            name: "test",
          },
          Tree.empty()
        )
        .subscribe({
          error: (err) => {
            expect(err).toBeTruthy();
            done();
          },
        });
    });

    it("fails with missing params: name", (done) => {
      schematicRunner.runSchematicAsync("ng-add", {}, appTree).subscribe({
        error: (err) => {
          expect(err).toBeTruthy();
          done();
        },
      });
    });

    it("fails with skipLib=true for missing lib", (done) => {
      const options: Schema = { ...defaultOptions, skipLib: true };

      schematicRunner.runSchematicAsync("ng-add", options, appTree).subscribe({
        error: (err) => {
          expect(err).toBeTruthy();
          done();
        },
      });
    });
  });
});

describe("ng-generate:create-schematics", () => {
  describe("with project", () => {
    let appTree: UnitTestTree;

    beforeEach(async () => {
      appTree = await schematicRunner
        .runExternalSchematicAsync(
          "@schematics/angular",
          "workspace",
          workspaceOptions
        )
        .toPromise();
      appTree = await schematicRunner
        .runExternalSchematicAsync(
          "@schematics/angular",
          "application",
          appOptions,
          appTree
        )
        .toPromise();
      appTree = await schematicRunner
        .runExternalSchematicAsync(
          "@schematics/angular",
          "library",
          { name: scopeWithName },
          appTree
        )
        .toPromise();
    });

    it("works", async () => {
      const options: CreateSchematicsOptions = {
        ...defaultCreateSchematicsOptions,
      };
      const tree: UnitTestTree = await schematicRunner
        .runSchematicAsync("create-schematics", options, appTree)
        .toPromise();

      expect(tree.files).toEqual(expect.arrayContaining(schematicResultFiles));
    });

    it("fails with missing tree", (done) => {
      const options: CreateSchematicsOptions = {
        ...defaultCreateSchematicsOptions,
      };

      schematicRunner
        .runSchematicAsync("create-schematics", options, Tree.empty())
        .subscribe({
          error: (err) => {
            expect(err).toBeTruthy();
            done();
          },
        });
    });

    it("fails with missing params: name", (done) => {
      schematicRunner
        .runSchematicAsync("create-schematics", {}, appTree)
        .subscribe({
          error: (err) => {
            expect(err).toBeTruthy();
            done();
          },
        });
    });
  });
});
