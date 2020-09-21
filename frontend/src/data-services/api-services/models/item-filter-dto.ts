import { FILTER_CONDITION, QUEUE_ITEMS_FIELD } from '../../../constants';

export interface ItemFilterDTO {
    field: QUEUE_ITEMS_FIELD;
    condition: FILTER_CONDITION;
    values: string[];
}