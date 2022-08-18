/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// eslint-disable-next-line max-classes-per-file
import { IDataSourceClient } from './client/data_source_client';

class OpenSearchDataSourceRouteHandlerContext {
  constructor(private dataSourceClient: IDataSourceClient) {}

  public async getClient(dataSourceId: string) {
    console.log(`zhongnan at data source route handler`);
    try {
      const client = await this.dataSourceClient.asDataSource(dataSourceId);
      return client;
    } catch (error) {
      // TODO:  Add audit log event
      if (error.message) {
        throw new Error(error.message);
      } else
        throw new Error(
          `Fail to get data source client for dataSource id: [${dataSourceId}]. Detail: ${error}`
        );
    }
  }
}

export class DataSourceRouteHandlerContext {
  readonly opensearch: OpenSearchDataSourceRouteHandlerContext;

  constructor(
    // private readonly coreStart: InternalCoreStart,
    private readonly dataSourceClient: IDataSourceClient
  ) {
    // this.opensearch = new CoreOpenSearchRouteHandlerContext(
    //   this.coreStart.opensearch,
    //   this.request
    // );
    // this.savedObjects = new CoreSavedObjectsRouteHandlerContext(
    //   this.coreStart.savedObjects,
    //   this.request
    // );
    // this.uiSettings = new CoreUiSettingsRouteHandlerContext(
    //   this.coreStart.uiSettings,
    //   this.savedObjects
    // );
    this.opensearch = new OpenSearchDataSourceRouteHandlerContext(this.dataSourceClient);
  }
}
