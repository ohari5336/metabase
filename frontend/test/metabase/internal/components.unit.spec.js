import renderer from "react-test-renderer";

import components from "metabase/internal/lib/components-node";

// generates a snapshot test for every example in every component's `.info.js`
components.map(
  ({ component, examples, noSnapshotTest, description, filename }) =>
    !noSnapshotTest &&
    describe(filename, () => {
      it(`should have displayName matching file name`, () => {
        const componentName = component
          ? component.displayName || component.name
          : "";

        expect(componentName.includes(filename)).toBe(true);
      });
      Object.entries(examples).map(([exampleName, element]) =>
        it(`should render "${exampleName}" correctly`, () => {
          expect(renderer.create(element).toJSON()).toMatchSnapshot();
        }),
      );
    }),
);
