/*
 * Copyright 2021 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Subscription } from '@backstage/core';
import {
  CatalogProcessingEngine,
  EntityProvider,
  EntityMessage,
  ProcessingStateManager,
  CatalogProcessingOrchestrator,
} from './types';

import { JsonObject } from '@backstage/config';
import { EntitiesCatalog } from '../catalog/types';
import { Logger } from 'winston';

export class CatalogProcessingEngineImpl implements CatalogProcessingEngine {
  private subscriptions: Subscription[] = [];
  private running: boolean = false;

  constructor(
    private readonly logger: Logger,
    private readonly entityProviders: EntityProvider[],
    private readonly stateManager: ProcessingStateManager,
    private readonly orchestrator: CatalogProcessingOrchestrator,
    private readonly entitiesCatalog: EntitiesCatalog,
  ) {}

  async start() {
    for (const provider of this.entityProviders) {
      const subscription = provider
        .entityChange$()
        .subscribe({ next: m => this.onNext(m) });
      this.subscriptions.push(subscription);
    }

    this.running = true;

    while (this.running) {
      const { entity, state, eager } = await this.stateManager.pop();

      const {
        completeEntities,
        deferredEntites,
        errors,
      } = await this.orchestrator.process({
        entity,
        state,
        eager,
      });

      for (const error of errors) {
        this.logger.warn(error.message);
      }

      for (const deferred of deferredEntites) {
        this.stateManager.setResult({
          request: { entity: deferred, state: new Map<string, JsonObject>() },
          nextRefresh: 'now()',
        });
      }

      if (completeEntities.length) {
        await this.entitiesCatalog.batchAddOrUpdateEntities(
          completeEntities.map(e => ({
            entity: e,
            relations: [],
          })),
          {
            locationId: 'xyz',
            dryRun: false,
            outputEntities: true,
          },
        );
      }
    }
  }

  async stop() {
    this.running = false;

    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
  private async onNext(message: EntityMessage) {
    if ('all' in message) {
      // TODO unhandled rejection
      await Promise.all(
        message.all.map(entity =>
          this.stateManager.setResult({
            request: { entity, state: new Map() },
            nextRefresh: 'now()',
          }),
        ),
      );
    }

    if ('added' in message) {
      await Promise.all(
        message.added.map(entity =>
          this.stateManager.setResult({
            request: { entity, state: new Map() },
            nextRefresh: 'now()',
          }),
        ),
      );

      // TODO deletions of message.removed
    }
  }
}
