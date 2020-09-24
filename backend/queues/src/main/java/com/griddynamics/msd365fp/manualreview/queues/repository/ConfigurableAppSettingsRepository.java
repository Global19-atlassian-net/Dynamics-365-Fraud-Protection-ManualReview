// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

package com.griddynamics.msd365fp.manualreview.queues.repository;

import com.griddynamics.msd365fp.manualreview.queues.model.persistence.ConfigurableAppSettings;
import com.microsoft.azure.spring.data.cosmosdb.repository.CosmosRepository;

import java.util.List;

public interface ConfigurableAppSettingsRepository extends CosmosRepository<ConfigurableAppSettings, String> {

    List<ConfigurableAppSettings> findAllByTypeAndActiveTrue(String type);

}
