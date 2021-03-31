/*
 * Copyright 2020 Spotify AB
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

// @ts-check

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('refresh_state', table => {
    table.comment('Location Refresh states');
    table.text('id').primary().notNullable().comment('Primary id');
    table
      .text('entity_ref')
      .primary()
      .notNullable()
      .comment('A reference to the entity that the refresh state is tied to');
    table
      .text('unprocessed_entity')
      .notNullable()
      .comment(
        'The unprocessed entity (in its source form, before being run through all of the processors) as JSON',
      );
    table
      .text('processed_entity')
      .nullable()
      .comment(
        'The processed entity (after running through all processors, but before being stitched together with state and relations) as JSON',
      );
    table
      .text('cache')
      .nullable()
      .comment(
        'Cache information tied to the refreshing of this entity, such as etag information or actual response caching',
      );
    table
      .text('errors')
      .notNullable()
      .comment('JSON array containing all errors related to entity');
    table
      .dateTime('next_update_at')
      .notNullable()
      .comment('Timestamp of when entity should be updated');
    table
      .dateTime('last_discovery_at')
      .notNullable()
      .comment('The last timestamp of which this entity was discovered');
    table.index('entity_ref', 'entity_ref_idx');
    table.index('next_update_at', 'next_update_at_idx');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('refresh_state', table => {
    table.dropIndex([], 'entity_ref_idx');
    table.dropIndex([], 'next_update_at_idx');
  });
  await knex.schema.dropTable('refresh_state');
};
