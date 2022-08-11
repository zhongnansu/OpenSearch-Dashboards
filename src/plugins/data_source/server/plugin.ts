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
import { DataSourceClient } from './client/data_source_client';
import { DataSourceRouteHandlerContext } from './data_source_route_handler_context';
import { DataSourceService } from './data_source_service';
import { dataSource, credential } from './saved_objects';

import { DataSourcePluginSetup, DataSourcePluginStart } from './types';

export class DataSourcePlugin implements Plugin<DataSourcePluginSetup, DataSourcePluginStart> {
  private readonly logger: Logger;
  private dataSourceService?: DataSourceService;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('data_source: Setup');

    // Register credential saved object type
    core.savedObjects.registerType(credential);

    // Register data source saved object type
    core.savedObjects.registerType(dataSource);

    this.dataSourceService = new DataSourceService();

    // Register plugin context to route handler context
    core.http.registerRouteHandlerContext('data_source', this.createRouteHandlerContext(core));

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('data_source: Started');
    return {};
  }

  public stop() {
    this.dataSourceService!.stop();
  }

  private createRouteHandlerContext = (
    core: CoreSetup
  ): IContextProvider<RequestHandler<unknown, unknown, unknown>, 'data_source'> => {
    return async (context, req) => {
      const [{ savedObjects }] = await core.getStartServices();
      const dataSourceClient = this.dataSourceService!.getDataSourceClient(
        this.logger,
        savedObjects.getScopedClient(req)
      );
      return new DataSourceRouteHandlerContext(dataSourceClient, this.logger);
    };
  };
}
