/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { CreateIndexPatternWizard } from './create_index_pattern_wizard';
import { IndexPattern } from '../../../../../plugins/data/public';
import { mockManagementPlugin } from '../../mocks';
import { IndexPatternCreationConfig } from '../../';
import { createComponentWithContext } from '../test_utils';
import { TIME_FIELD_STEP } from './lib';

jest.mock('./components/step_index_pattern', () => ({ StepIndexPattern: 'StepIndexPattern' }));
jest.mock('./components/step_time_field', () => ({ StepTimeField: 'StepTimeField' }));
jest.mock('./components/header', () => ({ Header: 'Header' }));
jest.mock('./components/loading_state', () => ({ LoadingState: 'LoadingState' }));
jest.mock('./lib/get_indices', () => ({
  getIndices: ({ pattern }: { pattern: string }) => {
    if (pattern === '*') {
      return [{ name: 'local-index' }];
    }
    if (pattern.includes('cluster1')) {
      return [{ name: 'cluster1:remote-index' }];
    }
    if (pattern.includes('cluster2')) {
      return [{ name: 'cluster2:remote-index' }];
    }
    return [];
  },
}));
const routeComponentPropsMock = {
  history: {
    push: jest.fn(),
  } as any,
  location: {} as any,
  match: {} as any,
};
const mockContext = mockManagementPlugin.createIndexPatternManagmentContext();
mockContext.indexPatternManagementStart.creation.getType = () => {
  return new IndexPatternCreationConfig({
    type: 'default',
    name: 'name',
  });
};

describe('CreateIndexPatternWizard', () => {
  test(`defaults to the loading state`, () => {
    const component = createComponentWithContext(
      CreateIndexPatternWizard,
      { ...routeComponentPropsMock },
      mockContext
    );

    expect(component).toMatchSnapshot();
  });

  test('renders the empty state when there are no indices', async () => {
    const component = createComponentWithContext(
      CreateIndexPatternWizard,
      { ...routeComponentPropsMock },
      mockContext
    );

    component.setState({
      isInitiallyLoadingIndices: false,
      allIndices: [],
      remoteClustersExist: false,
    });

    await component.update();
    expect(component).toMatchSnapshot();
  });

  test('renders when there are no indices but there are remote clusters', async () => {
    const component = createComponentWithContext(
      CreateIndexPatternWizard,
      { ...routeComponentPropsMock },
      mockContext
    );

    component.setState({
      isInitiallyLoadingIndices: false,
      allIndices: [],
      remoteClustersExist: true,
    });

    await component.update();
    expect(component).toMatchSnapshot();
  });

  test('shows system indices even if there are no other indices if the include system indices is toggled', async () => {
    const component = createComponentWithContext(
      CreateIndexPatternWizard,
      { ...routeComponentPropsMock },
      mockContext
    );

    component.setState({
      isInitiallyLoadingIndices: false,
      isIncludingSystemIndices: true,
      allIndices: [{ name: '.kibana ' }],
    });

    await component.update();
    expect(component).toMatchSnapshot();
  });

  test('renders index pattern step when there are indices', async () => {
    const component = createComponentWithContext(
      CreateIndexPatternWizard,
      { ...routeComponentPropsMock },
      mockContext
    );

    component.setState({
      isInitiallyLoadingIndices: false,
      allIndices: [{ name: 'myIndexPattern' }],
    });

    await component.update();
    expect(component).toMatchSnapshot();
  });

  test('renders time field step when step is set to TIME_FIELD_STEP', async () => {
    const component = createComponentWithContext(
      CreateIndexPatternWizard,
      { ...routeComponentPropsMock },
      mockContext
    );

    component.setState({
      isInitiallyLoadingIndices: false,
      allIndices: [{ name: 'myIndexPattern' }],
      step: TIME_FIELD_STEP,
    });

    await component.update();
    expect(component).toMatchSnapshot();
  });

  test('invokes the provided services when creating an index pattern', async () => {
    const newIndexPatternAndSave = jest.fn().mockImplementation(async () => {
      return indexPattern;
    });
    const clear = jest.fn();
    mockContext.data.indexPatterns.clearCache = clear;
    const indexPattern = ({
      id: '1',
      title: 'my-fake-index-pattern',
      timeFieldName: 'timestamp',
      fields: [],
      _fetchFields: jest.fn(),
    } as unknown) as IndexPattern;
    mockContext.data.indexPatterns.createAndSave = newIndexPatternAndSave;
    mockContext.data.indexPatterns.setDefault = jest.fn();

    const component = createComponentWithContext(
      CreateIndexPatternWizard,
      { ...routeComponentPropsMock },
      mockContext
    );

    component.setState({ indexPattern: 'foo' });
    await (component.instance() as CreateIndexPatternWizard).createIndexPattern(undefined, 'id');
    expect(newIndexPatternAndSave).toBeCalled();
    expect(clear).toBeCalledWith('1');
    expect(routeComponentPropsMock.history.push).toBeCalledWith(`/patterns/1`);
  });

  test('should render normally when use update UX', () => {
    mockContext.uiSettings.get = jest.fn().mockReturnValue(true);
    const component = createComponentWithContext(
      CreateIndexPatternWizard,
      { ...routeComponentPropsMock },
      mockContext
    );

    expect(component).toMatchSnapshot();
  });

  test('fetches remote indices for each related connection', async () => {
    const component = createComponentWithContext(
      CreateIndexPatternWizard,
      { ...routeComponentPropsMock },
      mockContext
    );

    // Setup mock data source with related connections
    const dataSourceRef = {
      id: 'test-datasource',
      title: 'Test DataSource',
      type: 'datasource',
      relatedConnections: [{ title: 'cluster1' }, { title: 'cluster2' }],
    };

    // Set initial state with data source reference
    component.setState({
      isInitiallyLoadingIndices: false,
      dataSourceRef,
      allIndices: [{ name: 'local-index' }],
    });

    // Call fetchData manually since we're setting state directly
    await (component.instance() as CreateIndexPatternWizard).fetchData();

    // Verify the state contains combined indices
    return new Promise((resolve) => {
      setImmediate(() => {
        const state = component.state() as any;
        expect(state.allIndices).toEqual(
          expect.arrayContaining([
            { name: 'local-index' },
            { name: 'cluster1:remote-index' },
            { name: 'cluster2:remote-index' },
          ])
        );
        expect(state.allIndices.length).toBe(3);
        resolve(undefined);
      });
    });
  });
});
