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

import {
  BitriseApp,
  BitriseBuildArtifact,
  BitriseBuildArtifactDetails,
  BitriseBuildListResponse,
  BitriseQueryParams,
} from './bitriseApi.model';

export interface BitriseApi {
  getBuilds(
    appSlug: string,
    params?: BitriseQueryParams,
  ): Promise<BitriseBuildListResponse>;

  getBuildWorkflows(appSlug: string): Promise<string[]>;

  getBuildArtifacts(
    appSlug: string,
    buildSlug: string,
  ): Promise<BitriseBuildArtifact[]>;

  getArtifactDetails(
    appSlug: string,
    buildSlug: string,
    artifactSlug: string,
  ): Promise<BitriseBuildArtifactDetails | undefined>;

  getApps(): Promise<BitriseApp[]>;

  getApp(appName: string): Promise<BitriseApp | undefined>;
}
