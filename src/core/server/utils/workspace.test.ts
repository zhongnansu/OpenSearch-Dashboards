/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { httpServerMock } from '../mocks';
import { getWorkspaceState, updateWorkspaceState } from './workspace';

describe('updateWorkspaceState', () => {
  it('update with payload', () => {
    const requestMock = httpServerMock.createOpenSearchDashboardsRequest();
    updateWorkspaceState(requestMock, {
      requestWorkspaceId: 'foo',
      isDashboardAdmin: true,
      isDataSourceAdmin: true,
    });
    expect(getWorkspaceState(requestMock)).toEqual({
      requestWorkspaceId: 'foo',
      isDashboardAdmin: true,
      isDataSourceAdmin: true,
    });
  });

  it('returns an empty workspace state when request app state is missing', () => {
    const requestMock = httpServerMock.createOpenSearchDashboardsRequest();

    expect(getWorkspaceState(requestMock)).toEqual({
      requestWorkspaceId: undefined,
      isDashboardAdmin: undefined,
      isDataSourceAdmin: undefined,
    });
  });
});
