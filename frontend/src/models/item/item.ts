// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    action, computed, observable
} from 'mobx';
import { Duration } from 'iso8601-duration';

import { IFacepilePersona } from '@fluentui/react/lib/Facepile';
import { DecisionDTO, ItemDTO, PurchaseDTO } from '../../data-services/api-services/models';
import { ItemNoteDTO } from '../../data-services/api-services/models/item-note-dto';
import { User } from '../user';
import { Decision } from './decision';
import { ItemHold } from './item-hold';
import { ItemLabel } from './item-label';
import { Purchase } from './purchase';
import { Note } from './note';
import {
    DEFAULT_TIME_TO_TIMEOUT_COUNT,
    DEFAULT_TIMEOUT_COUNTDOWN_INTERVAL_MILLISECONDS,
    LABEL,
} from '../../constants';
import { formatToLocaleDateString } from '../../utils/date';

export enum ITEM_STATUS {
    IN_PROGRESS = 'In Progress',
    AWAITING = 'Awaiting',
    ON_HOLD = 'On Hold',
    GOOD = 'Good',
    BAD = 'Bad',
    WATCH = 'Watch',
    ESCALATED = 'Escalated'
}

export class Item {
    id: string = '';

    active: boolean = true;

    @observable
    notes: Note[] = [];

    tags: string[] = [];

    queueIds: string[] = [];

    decision: Decision | null = null;

    purchase: Purchase = new Purchase();

    // An analyst who last updated the item status
    @observable
    analyst: User | null = null;

    importDate: Date | null = null;

    lockedDate: Date | null = null;

    lockedOnQueueId: string | null = null;

    lockedOnQueueViewId: string | null = null;

    hold: ItemHold | null = null;

    label: ItemLabel | null = null;

    @observable
    lockedById: string | null = null;

    timeLeft: Duration | null = null;

    @observable
    timeout: number | undefined = undefined;

    @observable
    selectedQueueId: string | undefined;

    /**
     * Reference on timeout countdown interval function
     */
    @observable timeoutIntervalRef: number | undefined = undefined;

    @action
    initItemTimeoutCountdown() {
        if (this.lockedDate
            && !this.timeoutIntervalRef
            && Item.isItemCurrentlyLocked(this.lockedDate)
        ) {
            this.timeoutIntervalRef = window
                .setInterval(this.enableTimeoutCountdownCallback, DEFAULT_TIMEOUT_COUNTDOWN_INTERVAL_MILLISECONDS);
        }
    }

    @action
    clearTimeoutInterval() {
        if (this.timeoutIntervalRef) {
            window.clearInterval(this.timeoutIntervalRef);
        }
    }

    @action
    setTimeLeft(timeLeft: Duration) {
        this.timeLeft = timeLeft;
    }

    @action
    selectQueueId(queueId?: string) {
        this.selectedQueueId = queueId;
    }

    @computed
    get hasNotes() {
        return this.notes && Array.isArray(this.notes) && this.notes.length;
    }

    @computed
    get hasTags() {
        return this.tags && Array.isArray(this.tags) && this.tags.length;
    }

    @computed
    get hasReviewers() {
        return this.lockedById && this.lockedById.length;
    }

    @computed
    get tagsJoined() {
        if (this.hasTags) {
            return this.tags.join(', ');
        }

        return '';
    }

    @computed
    get displayImportDateTime() {
        return formatToLocaleDateString(this.importDate, null);
    }

    @computed
    get amount() {
        if (this.purchase?.totalAmountInUSD) {
            return `$${this.purchase.totalAmountInUSD.toFixed(2)}`;
        }

        return '';
    }

    @computed
    get status(): ITEM_STATUS {
        const isInProgress = !!this.lockedDate;
        const isLabeled = !!this.label;

        if (isLabeled && this.label?.value === LABEL.GOOD) {
            return ITEM_STATUS.GOOD;
        }

        if (isLabeled && this.label?.value === LABEL.BAD) {
            return ITEM_STATUS.BAD;
        }

        if (isLabeled && (this.label?.value === LABEL.WATCH_NA || this.label?.value === LABEL.WATCH_INCONCLUSIVE)) {
            return ITEM_STATUS.WATCH;
        }

        if (isInProgress) {
            return ITEM_STATUS.IN_PROGRESS;
        }

        if (isLabeled && this.label?.value === LABEL.HOLD) {
            return ITEM_STATUS.ON_HOLD;
        }

        if (isLabeled && this.label?.value === LABEL.ESCALATE) {
            return ITEM_STATUS.ESCALATED;
        }

        return ITEM_STATUS.AWAITING;
    }

    @action
    setAnalyst(user: User) {
        this.analyst = user;
    }

    @computed
    get analystAsPersons(): IFacepilePersona[] {
        if (this.analyst) {
            return [{
                personaName: this.analyst.name,
                imageUrl: this.analyst.imageUrl,
                data: this.analyst
            }];
        }

        return [];
    }

    fromDTO(item: ItemDTO) {
        const {
            id,
            active,
            tags,
            notes,
            decision,
            purchase,
            imported,
            lock,
            hold,
            queueIds,
            label,
        } = item;

        this.id = id;
        this.active = active;
        this.tags = tags;
        this.queueIds = queueIds || [];
        this.notes = this
            .mapNote(notes)
            .sort((note1, note2) => new Date(note2.created as string).getTime() - new Date(note1.created as string).getTime());
        this.decision = decision ? this.mapDecision(decision) : null;
        this.purchase = purchase ? this.mapPurchase(purchase) : new Purchase();
        this.importDate = imported ? new Date(imported) : null;
        this.lockedDate = (lock && lock.locked) ? new Date(lock.locked) : null;
        this.lockedById = lock.ownerId;
        this.lockedOnQueueId = lock.queueId;
        this.lockedOnQueueViewId = lock.queueViewId;

        if (hold) {
            const holdModel = new ItemHold();

            this.hold = holdModel.fromDTO(hold);
        }

        if (this.lockedDate) {
            this.timeout = Item.getCurrentTimeout(this.lockedDate);
        }

        if (label) {
            const labelModel = new ItemLabel();

            this.label = labelModel.fromDTO(label);
        }

        if (this.label?.queueId) {
            this.queueIds = [this.label.queueId];
        }

        return this;
    }

    /**
     * Returns true if item still locked, otherwise false
     *
     * @param lockedDate - date when item has been locked
     */
    private static isItemCurrentlyLocked(lockedDate: Date) {
        const lockedTime = new Date(lockedDate).getTime();
        const LOCKED_ITEM_WILL_GONE_IN_MILLISECONDS = DEFAULT_TIME_TO_TIMEOUT_COUNT * 60 * 1000;

        const lockedWillGoneTime = lockedTime + LOCKED_ITEM_WILL_GONE_IN_MILLISECONDS;

        return lockedWillGoneTime > Date.now();
    }

    /**
     * Return number of minutes left till the item will be unlocked
     *
     * @param lockedDate - Date, date when item has been locked
     */
    private static getCurrentTimeout(lockedDate: Date) {
        const nowTime = new Date().getTime();
        const lockedTime = lockedDate.getTime();

        const difference = nowTime - lockedTime;
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        return DEFAULT_TIME_TO_TIMEOUT_COUNT - minutes;
    }

    @action
    private setItemTimeout(timeout: number) {
        this.timeout = timeout;
    }

    @action.bound
    private enableTimeoutCountdownCallback() {
        const currentTimeout = Item.getCurrentTimeout(this.lockedDate!);
        this.setItemTimeout(currentTimeout);

        if (this.timeout && this.timeout < 0) {
            window.clearInterval(this.timeoutIntervalRef);
        }
    }

    private mapNote(notes: ItemNoteDTO[]): Note[] {
        if (notes && Array.isArray(notes)) {
            return notes.map(note => {
                const noteModel = new Note();

                return noteModel.fromDTO(note);
            });
        }

        return [];
    }

    private mapDecision(decision: DecisionDTO): Decision {
        const decisionModel = new Decision();

        return decisionModel.fromDTO(decision);
    }

    private mapPurchase(purchase: PurchaseDTO): Purchase {
        const purchaseModel = new Purchase();

        return purchaseModel.fromDTO(purchase);
    }
}
