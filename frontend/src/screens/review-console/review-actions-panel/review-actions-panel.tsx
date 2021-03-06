// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    IBasePicker, ITag, TagPicker, ValidationState
} from '@fluentui/react/lib/Pickers';
import React, { Component, createRef } from 'react';
import cx from 'classnames';
import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';
import { resolve } from 'inversify-react';

import { FontIcon } from '@fluentui/react/lib/Icon';
import { Text } from '@fluentui/react/lib/Text';
import { TextField } from '@fluentui/react/lib/TextField';
import { ActionButton, DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Callout, DirectionalHint } from '@fluentui/react/lib/Callout';
import { Item, Queue } from '../../../models';
import { LABEL, LABEL_NAMES } from '../../../constants';
import { stringToKebabCase } from '../../../utils/text';
import { ReviewConsoleScreenStore } from '../../../view-services';
import { TYPES } from '../../../types';
import { ReviewNotes } from '../review-notes/review-notes';

import './review-actions-panel.scss';

interface ReviewActionsPanelProps {
    queue: Queue | null,
    item: Item | null,
    blockActionButtons: boolean;
    isBlur: boolean;
    onFinishReviewProcessCallback(): void;
    onLabeled: (label: LABEL) => Promise<void>;
}

interface ReviewActionsPanelOwnState {
    showWatchOptions: boolean;
}

const CN = 'review-actions-panel';

@observer
export class ReviewActionsPanel extends Component<ReviewActionsPanelProps, ReviewActionsPanelOwnState> {
    @resolve(TYPES.REVIEW_CONSOLE_SCREEN_STORE)
    private reviewConsoleScreenStore!: ReviewConsoleScreenStore;

    constructor(props: ReviewActionsPanelProps) {
        super(props);
        this.state = {
            showWatchOptions: false
        };
    }

    @autobind
    handleLabelClick(event: React.MouseEvent<HTMLElement>) {
        const { onLabeled } = this.props;
        const label = event.currentTarget.getAttribute('data-action') as LABEL;
        onLabeled(label);
    }

    @autobind
    handleAddNoteClick() {
        this.reviewConsoleScreenStore.setIsInAddNoteMode(true);
    }

    @autobind
    handleAddTagClick() {
        this.reviewConsoleScreenStore.setIsInAddTagMode(true);
    }

    @autobind
    renderWatchButton(showWatchNA: boolean, showWatchInconclusive: boolean, isFullSize: boolean) {
        const { blockActionButtons, onLabeled } = this.props;
        const { showWatchOptions } = this.state;
        const dropdownOptions: LABEL[] = [];
        const buttonClass = `${CN}__watch-btn`;

        if (showWatchNA) {
            dropdownOptions.push(LABEL.WATCH_NA);
        }
        if (showWatchInconclusive) {
            dropdownOptions.push(LABEL.WATCH_INCONCLUSIVE);
        }

        const onLabelClick = (label: LABEL) => {
            onLabeled(label);
            this.setState({ showWatchOptions: !showWatchOptions });
        };

        const renderButton = () => (
            <button
                type="button"
                className={cx(buttonClass, { [`${buttonClass}--full-size`]: isFullSize, active: showWatchOptions })}
                onClick={() => this.setState({ showWatchOptions: !showWatchOptions })}
                disabled={blockActionButtons}
            >
                <FontIcon
                    className={`${CN}__btn-label-icon`}
                    iconName="RedEye"
                />
                <Text>Watch</Text>
                <FontIcon
                    className={`${CN}__control-btn-down`}
                    iconName="ChevronDownMed"
                />
            </button>
        );

        const renderOptions = () => (
            <Callout
                className={`${CN}__watch-options`}
                hidden={!showWatchOptions}
                isBeakVisible={false}
                directionalHint={DirectionalHint.bottomRightEdge}
                gapSpace={6}
                target={`.${buttonClass}`}
                onDismiss={() => this.setState({ showWatchOptions: false })}
            >
                {
                    dropdownOptions.map(option => (
                        <button
                            key={stringToKebabCase(option)}
                            type="button"
                            onClick={() => onLabelClick(option)}
                            className={`${CN}__watch-option`}
                        >
                            { LABEL_NAMES[option] }
                        </button>
                    ))
                }
            </Callout>
        );

        return (
            <>
                {renderButton()}
                {renderOptions()}
            </>
        );
    }

    @autobind
    renderEscalateButton(isFullSize?: boolean) {
        const { blockActionButtons } = this.props;

        return (
            <button
                type="button"
                data-action={LABEL.ESCALATE}
                className={cx(
                    `${CN}__hold-escalate-btn`,
                    { [`${CN}__hold-escalate-btn--full-size`]: isFullSize }
                )}
                onClick={this.handleLabelClick}
                disabled={blockActionButtons}
            >
                <FontIcon
                    className={`${CN}__btn-label-icon`}
                    iconName="FollowUser"
                />
                <Text>Escalate</Text>
            </button>
        );
    }

    @autobind
    renderHoldButton(isFullSize?: boolean) {
        const { blockActionButtons } = this.props;

        return (
            <button
                type="button"
                data-action={LABEL.HOLD}
                className={cx(
                    `${CN}__hold-escalate-btn`,
                    { [`${CN}__hold-escalate-btn--full-size`]: isFullSize }
                )}
                onClick={this.handleLabelClick}
                disabled={blockActionButtons}
            >
                <FontIcon
                    className={`${CN}__btn-label-icon`}
                    iconName="HourGlass"
                />
                <Text>Hold</Text>
            </button>
        );
    }

    @autobind
    renderAddBtn(callback: () => void, label: string, iconName?: string) {
        const { blockActionButtons } = this.props;

        return (
            <button
                type="button"
                className={`${CN}__add-tag-note-btn`}
                onClick={callback}
                disabled={blockActionButtons}
            >
                <div className={`${CN}__btn-tagnote-icon`}>
                    <FontIcon iconName={iconName || 'Message'} className="link-icon" />
                </div>
                <Text>{label}</Text>
            </button>
        );
    }

    @autobind
    renderTagsSection() {
        const { item: reviewItem } = this.props;
        const {
            tagToAdd,
            isInAddTagMode,
            reviewItemTags,
            isTagSubmitting
        } = this.reviewConsoleScreenStore;

        if (!reviewItem) {
            return null;
        }

        const { tags } = reviewItem;

        const getTagFromText = (text: string): ITag => ({
            name: text,
            key: text
        });

        const getTextFromTag = (tag: ITag) => tag.name;

        const getSuggestions = async (term: string, selectedItems?: ITag[]) => {
            const textSuggestions = await this.reviewConsoleScreenStore.getTagSuggestions(term.trim());
            const filteredTextSuggestions = textSuggestions.filter((suggestion: string) => !selectedItems?.find(selected => selected.name === suggestion));
            return filteredTextSuggestions.map(getTagFromText);
        };

        const getAllSuggestions = (selectedItems?: ITag[]) => getSuggestions('', selectedItems);

        const onChange = (items?: ITag[]) => {
            if (items) {
                const newValues: string[] = [];
                items.forEach(item => {
                    const newValue = item.name.trim();
                    if (newValue) {
                        newValues.push(newValue);
                    }
                });
                this.reviewConsoleScreenStore.setReviewItemTags(newValues);
                this.reviewConsoleScreenStore.submitNewTags();
            }
        };

        const onInputChange = (newValue: string) => {
            this.reviewConsoleScreenStore.setNewTagValue(newValue.trim());
            return newValue;
        };

        const onBlur = () => this.reviewConsoleScreenStore.discardNewTags();

        const onValidateInput = (input: string): ValidationState => {
            if (input.trim()) return ValidationState.valid;
            return ValidationState.invalid;
        };

        const selectedItems = reviewItemTags.map(getTagFromText);

        const inputRef = createRef<IBasePicker<ITag>>();

        const addCustomTag = (value: string) => {
            this.reviewConsoleScreenStore.addNewTag(value);
            this.reviewConsoleScreenStore.setNewTagValue('');
            inputRef.current?.completeSuggestion(true);
        };

        const renderNoSuggestionsFound = () => (
            <div className={`${CN}__no-tag-found`}>
                {
                    tags.includes(tagToAdd)
                        ? <Text className={`${CN}__no-tag-found-text`}>{`Custom tag "${tagToAdd}" is already in the list`}</Text>
                        : (
                            <>
                                <Text className={`${CN}__no-tag-found-text`}>No tags found</Text>
                                <ActionButton
                                    className={`${CN}__add-custom-tag-btn`}
                                    iconProps={{ iconName: 'AddTo' }}
                                    onClick={() => addCustomTag(tagToAdd)}
                                >
                                    { `Add a custom tag "${tagToAdd}"` }
                                </ActionButton>
                            </>
                        )
                }
            </div>
        );

        if ((tags && tags.length) || isInAddTagMode) {
            return (
                <TagPicker
                    className={`${CN}__add-tag`}
                    componentRef={inputRef}
                    onResolveSuggestions={getSuggestions}
                    onEmptyResolveSuggestions={getAllSuggestions}
                    getTextFromItem={getTextFromTag}
                    pickerSuggestionsProps={{
                        suggestionsHeaderText: 'Suggested tags',
                        onRenderNoResultFound: renderNoSuggestionsFound
                    }}
                    selectedItems={selectedItems}
                    onInputChange={onInputChange}
                    onChange={onChange}
                    onBlur={onBlur}
                    createGenericItem={getTagFromText}
                    onValidateInput={onValidateInput}
                    resolveDelay={250}
                    disabled={isTagSubmitting}
                    inputProps={{ autoFocus: isInAddTagMode }}
                />
            );
        }

        return this.renderAddBtn(this.handleAddTagClick, 'Add a custom tag', 'Tag');
    }

    @autobind
    renderAddNote() {
        const { isInAddNoteMode, noteToAdd, isNoteSubmitting } = this.reviewConsoleScreenStore;

        const renderNoteSubmitting = () => (
            <Spinner className={`${CN}__submit-note-spinner`} label="Submitting..." />
        );

        const renderAddNoteFields = () => (
            <div className={`${CN}__add-note`}>
                <TextField
                    className={`${CN}__add-note-field`}
                    borderless
                    placeholder="Write a note"
                    multiline
                    autoAdjustHeight
                    onChange={(_: any, newValue?: string) => this.reviewConsoleScreenStore.setNewNoteValue(newValue || '')}
                    resizable={false}
                />
                <PrimaryButton
                    text="Submit"
                    onClick={() => this.reviewConsoleScreenStore.submitNewNote()}
                    className={`${CN}__submit-note-btn`}
                    disabled={!noteToAdd}
                />
                <DefaultButton
                    text="Cancel"
                    onClick={() => this.reviewConsoleScreenStore.discardNewNote()}
                    className={`${CN}__cancel-note-btn`}
                />
            </div>
        );

        if (isNoteSubmitting) {
            return renderNoteSubmitting();
        }

        if (isInAddNoteMode) {
            return renderAddNoteFields();
        }

        return this.renderAddBtn(this.handleAddNoteClick, 'Add a note');
    }

    @autobind
    renderNotes() {
        const { reviewItem } = this.reviewConsoleScreenStore;

        return (
            <ReviewNotes
                className={`${CN}__user_notes`}
                notes={reviewItem?.notes || []}
            />
        );
    }

    render() {
        const {
            queue,
            blockActionButtons,
            isBlur,
            onFinishReviewProcessCallback
        } = this.props;

        if (!queue) {
            return null;
        }

        const { allowedLabels, forEscalations } = queue;

        const showGood = allowedLabels.includes(LABEL.GOOD);
        const showBad = allowedLabels.includes(LABEL.BAD);
        const showHold = allowedLabels.includes(LABEL.HOLD) && forEscalations;
        const showEscalate = allowedLabels.includes(LABEL.ESCALATE);
        const showWatchNA = allowedLabels.includes(LABEL.WATCH_NA);
        const showWatchInconclusive = allowedLabels.includes(LABEL.WATCH_INCONCLUSIVE);
        const showWatch = showWatchNA || showWatchInconclusive;

        return (
            <div className={cx(
                CN,
                { [`${CN}--blured`]: isBlur },
                { [`${CN}--blocked`]: blockActionButtons }
            )}
            >
                <div className={`${CN}__label-buttons`}>
                    {
                        showGood && (
                            <button
                                type="button"
                                data-action={LABEL.GOOD}
                                className={`${CN}__good-btn`}
                                onClick={this.handleLabelClick}
                                disabled={blockActionButtons}
                            >
                                <FontIcon iconName="CompletedSolid" className={`${CN}__btn-label-icon`} />
                                <Text>{LABEL_NAMES[LABEL.GOOD]}</Text>
                            </button>
                        )
                    }
                    {
                        showBad && (
                            <button
                                type="button"
                                data-action={LABEL.BAD}
                                className={`${CN}__bad-btn`}
                                onClick={this.handleLabelClick}
                                disabled={blockActionButtons}
                            >
                                <FontIcon iconName="Blocked2Solid" className={`${CN}__btn-label-icon`} />
                                <Text>{LABEL_NAMES[LABEL.BAD]}</Text>
                            </button>
                        )
                    }
                    {showHold && this.renderHoldButton(!showWatch)}
                    {showEscalate && this.renderEscalateButton(!showWatch)}
                    {showWatch && this.renderWatchButton(showWatchNA, showWatchInconclusive, !showEscalate && !showHold)}
                </div>
                <div className={`${CN}__tag-note-section`}>
                    { this.renderTagsSection() }
                    { this.renderAddNote() }
                </div>
                { this.renderNotes() }
                <button
                    type="button"
                    className={cx(`${CN}__finish-review-btn`)}
                    onClick={onFinishReviewProcessCallback}
                    disabled={blockActionButtons}
                >
                    <FontIcon iconName="UnlockSolid" className={`${CN}__finish-review-btn-icon`} />
                    <Text>Unlock order</Text>
                </button>
            </div>
        );
    }
}
