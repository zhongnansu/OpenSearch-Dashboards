/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
  IContextProvider,
  RequestHandler,
} from '../../../../src/core/server';
import { DataSourceRouteHandlerContext } from './data_source_route_handler_context';
import { dataSource, credential } from './saved_objects';

import { DataSourcePluginSetup, DataSourcePluginStart } from './types';
import { DataSourceClient } from './client';

export class DataSourcePlugin implements Plugin<DataSourcePluginSetup, DataSourcePluginStart> {
  private readonly logger: Logger;
  private readonly dataSourceClient: DataSourceClient;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    this.dataSourceClient = new DataSourceClient(this.logger);
  }

  public async setup(core: CoreSetup) {
    this.logger.info('data_source: Setup');

    // Register credential saved object type
    core.savedObjects.registerType(credential);

    // Register data source saved object type
    core.savedObjects.registerType(dataSource);

    core.http.registerRouteHandlerContext('data_source', this.createRouteHandlerContext(core));

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('data_source: Started');
    return {};
  }

  public stop() {
    this.dataSourceClient.close();
  }

  private createRouteHandlerContext = (
    core: CoreSetup
  ): IContextProvider<RequestHandler<unknown, unknown, unknown>, 'data_source'> => {
    return async (context, req) => {
      const [{ savedObjects }] = await core.getStartServices();
      this.dataSourceClient.attachSavedObjectClient(savedObjects.getScopedClient(req));
      return new DataSourceRouteHandlerContext(this.dataSourceClient);
    };
  };
}
