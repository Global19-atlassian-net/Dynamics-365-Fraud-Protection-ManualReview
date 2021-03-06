// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { inject, injectable } from 'inversify';
import {
    DEFAULT_QUEUE_ITEMS_PER_PAGE, DICTIONARY_TYPE, LABEL, SETTING_TYPE
} from '../../constants';
import { Item, PageableList, Queue } from '../../models';
import { TYPES } from '../../types';
import { AzureMapsService, Logger, UserBuilder } from '../../utility-services';
import { SettingDTO } from '../api-services/models';
import { BaseDomainService } from '../base-domain-service';
import {
    GetLinkAnalysisDfpItemsTransformer,
    GetLinkAnalysisMrItemsTransformer,
    GetLockedItemsTransformer,
    GetReviewItemTransformer,
    PostLinkAnalysisTransformer
} from '../data-transformers';
import {
    BatchItemsLabelApiParams,
    DictionaryApiService,
    ItemApiService,
    ItemService,
    QueueApiService,
    SettingsApiService,
    UserService
} from '../interfaces';
import { LinkAnalysisDfpItem, LinkAnalysisMrItem, PostLinkAnalysisBody } from '../../models/item/link-analysis';

@injectable()
export class ItemServiceImpl extends BaseDomainService implements ItemService {
    private settingsMap: Map<SETTING_TYPE, SettingDTO[]> = new Map();

    constructor(
        @inject(TYPES.ITEM_API_SERVICE) private readonly itemApiService: ItemApiService,
        @inject(TYPES.QUEUE_API_SERVICE) private readonly queueApiService: QueueApiService,
        @inject(TYPES.USER_SERVICE) private readonly userService: UserService,
        @inject(TYPES.LOGGER) protected readonly logger: Logger,
        @inject(TYPES.USER_BUILDER) protected readonly userBuilder: UserBuilder,
        @inject(TYPES.AZURE_MAPS_SERVICE) protected readonly azureMapsService: AzureMapsService,
        @inject(TYPES.DICTIONARY_API_SERVICE) private readonly dictionaryApiService: DictionaryApiService,
        @inject(TYPES.SETTINGS_API_SERVICE) private readonly settingsApiService: SettingsApiService
    ) {
        super(logger, 'ItemService');
        this.loadSettings(SETTING_TYPE.REVIEW_CONSOLE_LINKS);
    }

    /**
     * Get list of queues
     * @param queueId
     */
    async getReviewItem(
        queueId: string
    ): Promise<Item | null> {
        const dataTransformer = new GetReviewItemTransformer(this.userService, this.userBuilder, this.azureMapsService);
        let response;

        try {
            response = await this.queueApiService.lockTopQueueItem(queueId);
        } catch (e) {
            throw this.handleApiException('lockTopQueueItem', e, {
                500: `Failed to lock top queue item for ${queueId}`
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getReviewItem',
                    'Failed to parse response from API while locking top queue item',
                    e
                );
            }
        } else if (response.status === 204) {
            throw this.handleException(
                'getReviewItem',
                'All of the items in this queue are locked',
                new Error('All of the items in this queue are locked')
            );
        }

        return null;
    }

    async getUnorderedQueueReviewItem(
        queueId: string,
        itemId: string
    ): Promise<Item | null> {
        const dataTransformer = new GetReviewItemTransformer(this.userService, this.userBuilder, this.azureMapsService);
        let response;

        try {
            response = await this.queueApiService.lockQueueItem(queueId, itemId);
        } catch (e) {
            throw this.handleApiException('lockQueueItem', e, {
                500: `Failed to lock queue item ${itemId} for queue ${queueId}`
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getUnorderedQueueReviewItem',
                    'Failed to parse response from API while locking queue item',
                    e
                );
            }
        } else if (response.status === 204) {
            throw this.handleException(
                'getUnorderedQueueReviewItem',
                'All of the items in this queue are locked',
                new Error('All of the items in this queue are locked')
            );
        }

        return null;
    }

    async startReview(queue: Queue, item?: Item): Promise<Item | null> {
        let reviewItem = null;

        if (queue.sortingLocked) {
            reviewItem = await this.getReviewItem(queue.viewId);
        } else if (item) {
            reviewItem = await this.getUnorderedQueueReviewItem(queue.viewId, item.id);
        }
        return reviewItem;
    }

    async finishReview(itemId: string, queueId?: string): Promise<Item | null> {
        const dataTransformer = new GetReviewItemTransformer(this.userService, this.userBuilder, this.azureMapsService);
        let response;

        try {
            response = await this.itemApiService.deleteItemLock(itemId, queueId);
        } catch (e) {
            throw this.handleApiException('deleteItemLock', e, {
                500: `Failed to unlock queue item ${itemId}`
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'finishReview',
                    'Failed to parse response from API while unlocking the queue item',
                    e
                );
            }
        }

        return null;
    }

    async getItem(itemId: string, queueId?: string): Promise<Item | null> {
        const dataTransformer = new GetReviewItemTransformer(this.userService, this.userBuilder, this.azureMapsService);

        let response;

        try {
            response = await this.itemApiService.getItem(itemId, queueId);
        } catch (e) {
            throw this.handleApiException('getItem', e, {
                500: `Failed to load order item with id ${itemId}`
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getItem',
                    'Failed to parse response from API while locking top queue item',
                    e
                );
            }
        } else if (response.status === 204) {
            throw this.handleException(
                'getItem',
                'All of the items in this queue are locked',
                new Error('All of the items in this queue are locked')
            );
        }

        return null;
    }

    /**
     * label item
     * @param itemId
     * @param label
     * @param queueId
     */
    async labelItem(
        itemId: string,
        label: LABEL,
        queueId?: string
    ) {
        let response;

        try {
            response = await this.itemApiService.patchItemLabel(itemId, label, queueId);
        } catch (e) {
            throw this.handleApiException('labelItem', e, {
                500: `Failed to apply label to an item ${itemId}`
            });
        }

        try {
            // return dataTransformer.mapResponse(response.data);
            return response;
        } catch (e) {
            throw this.handleException(
                'getReviewItem',
                'Failed to parse response from API while locking top queue item',
                e
            );
        }
    }

    async batchLabelItems(params: BatchItemsLabelApiParams) {
        let response;

        try {
            response = await this.itemApiService.patchBatchLabel(params);
        } catch (e) {
            throw this.handleApiException('patchBatchLabel', e, {
                500: `Failed to apply batch label to an items ${params.itemIds.join(', ')}`
            });
        }

        try {
            return response.data;
        } catch (e) {
            throw this.handleException(
                'batchLabelItems',
                'Failed to parse response from API while label batch items',
                e
            );
        }
    }

    async putItemNote(
        itemId: string,
        note: string,
        queueId?: string
    ) {
        try {
            return await this.itemApiService.putItemNote(itemId, note, queueId);
        } catch (e) {
            throw this.handleApiException('putItemNote', e, {
                500: `Failed to add note to an item ${itemId}`
            });
        }
    }

    async patchItemTags(
        itemId: string,
        tags: string[],
        queueId?: string,
    ) {
        try {
            return await this.itemApiService.patchItemTag(itemId, tags, queueId);
        } catch (e) {
            throw this.handleApiException('putItemTag', e, {
                500: `Failed to add tag to an item ${itemId}`
            });
        }
    }

    async getLockedItems() {
        const dataTransformer = new GetLockedItemsTransformer();
        let response;

        try {
            response = await this.itemApiService.getLockedItems();
        } catch (e) {
            throw this.handleApiException('getLockedItems', e, {
                500: 'Failed to get locked items'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'getLockedItems',
                    'Failed to parse response from API while trying to get locked items',
                    e
                );
            }
        }

        return null;
    }

    /**
     * Search for Tag to use in Tag picker
     * @param term - search term
     */
    async searchTag(term: string) {
        try {
            const response = await this.dictionaryApiService.getDictionaryValues(DICTIONARY_TYPE.TAG, term);
            return response.data;
        } catch (e) {
            return [];
        }
    }

    async putTag(tag: string) {
        return this.dictionaryApiService.postDictionaryValues(DICTIONARY_TYPE.TAG, tag);
    }

    private getSettings(type: SETTING_TYPE) {
        if (this.settingsMap.has(type)) {
            return this.settingsMap.get(type);
        }

        return null;
    }

    private async loadSettings(type: SETTING_TYPE) {
        try {
            const { data } = await this.settingsApiService.getSettingValues(type);
            this.settingsMap.set(type, data);
        } catch (e) {
            this.logger.warn('Failed to load item settings');
        }
    }

    async postLinkAnalysis(postLinkAnalysisBody: PostLinkAnalysisBody) {
        const dataTransformer = new PostLinkAnalysisTransformer();
        let response;

        try {
            response = await this.itemApiService.postLinkAnalysis(postLinkAnalysisBody);
        } catch (e) {
            throw this.handleApiException('postLinkAnalysis', e, {
                500: 'Failed to post link analysis body'
            });
        }

        if (response.data) {
            try {
                return dataTransformer.mapResponse(response.data);
            } catch (e) {
                throw this.handleException(
                    'postLinkAnalysis',
                    'Failed to parse response from API while trying post link analysis body',
                    e
                );
            }
        }

        return null;
    }

    async getLinkAnalysisMrItems(
        chainContinuationIdentifier: string,
        id: string,
        shouldLoadMore: boolean,
        size: number = DEFAULT_QUEUE_ITEMS_PER_PAGE
    ): Promise<PageableList<LinkAnalysisMrItem>> {
        const dataTransformer = new GetLinkAnalysisMrItemsTransformer(this.userBuilder);
        const uniqueSequenceChainId = `${chainContinuationIdentifier}-${id}`;
        let response;

        try {
            const token = shouldLoadMore ? this.getContinuationToken(uniqueSequenceChainId) : null;
            response = await this.itemApiService.getLinkAnalysisMrItems(id, size, token);
        } catch (e) {
            throw this.handleApiException('getLinkAnalysisMrItems', e, {
                500: `Failed to get link analysis mr items for search id (${id}) from the Api due to internal server error`
            });
        }

        try {
            const canLoadMore = this.storeContinuationToken(uniqueSequenceChainId, response.data);

            return {
                data: dataTransformer.mapResponse(response.data),
                canLoadMore
            };
        } catch (e) {
            throw this.handleException(
                'getLinkAnalysisItems',
                `Failed to parse response from API while getting items for mr link analysis (${id})`,
                e
            );
        }
    }

    async getLinkAnalysisDfpItems(
        chainContinuationIdentifier: string,
        id: string,
        shouldLoadMore: boolean,
        size: number = DEFAULT_QUEUE_ITEMS_PER_PAGE
    ): Promise<PageableList<LinkAnalysisDfpItem>> {
        const dataTransformer = new GetLinkAnalysisDfpItemsTransformer(this.userBuilder);
        const uniqueSequenceChainId = `${chainContinuationIdentifier}-${id}`;
        let response;

        try {
            const token = shouldLoadMore ? this.getContinuationToken(uniqueSequenceChainId) : null;
            response = await this.itemApiService.getLinkAnalysisDfpItems(id, size, token);
        } catch (e) {
            throw this.handleApiException('getLinkAnalysisDfpItems', e, {
                500: `Failed to get link analysis dfp items for search id (${id}) from the Api due to internal server error`
            });
        }

        try {
            const canLoadMore = this.storeContinuationToken(uniqueSequenceChainId, response.data);

            return {
                data: dataTransformer.mapResponse(response.data),
                canLoadMore
            };
        } catch (e) {
            throw this.handleException(
                'getLinkAnalysisDfpItems',
                `Failed to parse response from API while getting items for mr link analysis (${id})`,
                e
            );
        }
    }
}
