/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  EuiSmallButtonIcon,
  EuiContextMenu,
  EuiPopover,
  EuiPopoverTitle,
  EuiToolTip,
  EuiButton,
  EuiPopoverFooter,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSmallButtonEmpty,
  EuiIcon,
  EuiResizeObserver,
  EuiContextMenuPanel,
} from '@elastic/eui';
import { stringify } from '@osd/std';
import { FormattedMessage, InjectedIntl, injectI18n } from '@osd/i18n/react';
import { Component } from 'react';
import { i18n } from '@osd/i18n';
import React from 'react';
import {
  buildEmptyFilter,
  Filter,
  enableFilter,
  disableFilter,
  pinFilter,
  toggleFilterDisabled,
  toggleFilterNegated,
  unpinFilter,
  UI_SETTINGS,
  IIndexPattern,
} from '../../../common';
import { FilterEditor } from './filter_editor';
import { useOpenSearchDashboards } from '../../../../opensearch_dashboards_react/public';

interface Props {
  intl: InjectedIntl;
  filters: Filter[];
  indexPatterns: IIndexPattern[];
  savedQueryManagement?: React.JSX.Element;
  onFiltersUpdated?: (filters: Filter[]) => void;
}
const maxFilterWidth = 600;

const FilterOptionsUI = (props: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [renderedComponent, setRenderedComponent] = React.useState('menu');
  const [filterWidth, setFilterWidth] = React.useState(maxFilterWidth);
  const [showSaveQueryButton, setShowSaveQueryButton] = React.useState(true);
  const opensearchDashboards = useOpenSearchDashboards();
  const uiSettings = opensearchDashboards.services.uiSettings;
  const isPinned = uiSettings!.get(UI_SETTINGS.FILTERS_PINNED_BY_DEFAULT);
  const [indexPattern] = props.indexPatterns;
  const index = indexPattern && indexPattern.id;
  const newFilter = buildEmptyFilter(isPinned, index);

  const togglePopover = () => {
    setRenderedComponent('menu');
    setShowSaveQueryButton(true);
    setIsPopoverOpen((prevState) => !prevState);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  function onFiltersUpdated(filters: Filter[]) {
    if (props.onFiltersUpdated) {
      props.onFiltersUpdated(filters);
    }
  }

  function onEnableAll() {
    const filters = props.filters.map(enableFilter);
    onFiltersUpdated(filters);
  }

  function onDisableAll() {
    const filters = props.filters.map(disableFilter);
    onFiltersUpdated(filters);
  }

  function onPinAll() {
    const filters = props.filters.map(pinFilter);
    onFiltersUpdated(filters);
  }

  function onUnpinAll() {
    const filters = props.filters.map(unpinFilter);
    onFiltersUpdated(filters);
  }

  function onToggleAllNegated() {
    const filters = props.filters.map(toggleFilterNegated);
    onFiltersUpdated(filters);
  }

  function onToggleAllDisabled() {
    const filters = props.filters.map(toggleFilterDisabled);
    onFiltersUpdated(filters);
  }

  function onRemoveAll() {
    onFiltersUpdated([]);
  }

  function onAdd(filter: Filter) {
    setIsPopoverOpen(false);
    const filters = [...props.filters, filter];
    onFiltersUpdated(filters);
  }

  function onResize(dimensions: { height: number; width: number }) {
    setFilterWidth(dimensions.width);
  }

  const panelTree = [
    {
      id: 0,
      title: 'Filters',
      items: [
        {
          name: props.intl.formatMessage({
            id: 'data.filter.options.addFiltersButtonLabel',
            defaultMessage: 'Add filters',
          }),
          icon: 'plusInCircle',
          onClick: () => {
            setRenderedComponent('addFilter');
            setShowSaveQueryButton(false);
          },

          // panel: 1,
          'data-test-subj': 'addFilters',
        },
        {
          name: props.intl.formatMessage({
            id: 'data.filter.options.enableAllFiltersButtonLabel',
            defaultMessage: 'Enable all',
          }),
          icon: 'eye',
          onClick: () => {
            closePopover();
            onEnableAll();
          },
          'data-test-subj': 'enableAllFilters',
        },
        {
          name: props.intl.formatMessage({
            id: 'data.filter.options.disableAllFiltersButtonLabel',
            defaultMessage: 'Disable all',
          }),
          icon: 'eyeClosed',
          onClick: () => {
            closePopover();
            onDisableAll();
          },
          'data-test-subj': 'disableAllFilters',
        },
        {
          name: props.intl.formatMessage({
            id: 'data.filter.options.pinAllFiltersButtonLabel',
            defaultMessage: 'Pin all',
          }),
          icon: 'pin',
          onClick: () => {
            closePopover();
            onPinAll();
          },
          'data-test-subj': 'pinAllFilters',
        },
        {
          name: props.intl.formatMessage({
            id: 'data.filter.options.unpinAllFiltersButtonLabel',
            defaultMessage: 'Unpin all',
          }),
          icon: 'pin',
          onClick: () => {
            closePopover();
            onUnpinAll();
          },
          'data-test-subj': 'unpinAllFilters',
        },
        {
          name: props.intl.formatMessage({
            id: 'data.filter.options.invertNegatedFiltersButtonLabel',
            defaultMessage: 'Invert inclusion',
          }),
          icon: 'invert',
          onClick: () => {
            closePopover();
            onToggleAllNegated();
          },
          'data-test-subj': 'invertInclusionAllFilters',
        },
        {
          name: props.intl.formatMessage({
            id: 'data.filter.options.invertDisabledFiltersButtonLabel',
            defaultMessage: 'Invert enabled/disabled',
          }),
          icon: 'eye',
          onClick: () => {
            closePopover();
            onToggleAllDisabled();
          },
          'data-test-subj': 'invertEnableDisableAllFilters',
        },
        {
          name: props.intl.formatMessage({
            id: 'data.filter.options.deleteAllFiltersButtonLabel',
            defaultMessage: 'Remove all',
          }),
          icon: 'trash',
          onClick: () => {
            closePopover();
            onRemoveAll();
          },
          'data-test-subj': 'removeAllFilters',
        },
      ],
    },
  ];

  const renderComponent = () => {
    switch (renderedComponent) {
      case 'menu':
        return <EuiContextMenu initialPanelId={0} panels={panelTree} size="s" />;
      case 'addFilter':
        return (
          <EuiContextMenuPanel
            items={[
              <EuiResizeObserver onResize={onResize}>
                {(resizeRef) => (
                  <div style={{ width: maxFilterWidth, maxWidth: '100%' }} ref={resizeRef}>
                    <EuiFlexItem style={{ width: filterWidth }} grow={false}>
                      <FilterEditor
                        filter={newFilter}
                        indexPatterns={props.indexPatterns}
                        onSubmit={onAdd}
                        onCancel={() => setIsPopoverOpen(false)}
                        key={stringify(newFilter)}
                      />
                    </EuiFlexItem>
                  </div>
                )}
              </EuiResizeObserver>,
            ]}
          />
        );
      case 'saveQuery':
        return props.savedQueryManagement;
    }
  };

  return (
    <EuiPopover
      id="popoverForAllFilters"
      className="globalFilterGroup__allFiltersPopover"
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      button={
        <EuiToolTip
          content={props.intl.formatMessage({
            id: 'data.filter.options.changeAllFiltersButtonLabel',
            defaultMessage: 'Change all filters',
          })}
          delay="long"
          position="bottom"
        >
          <EuiSmallButtonEmpty
            onClick={togglePopover}
            aria-label={props.intl.formatMessage({
              id: 'data.filter.options.changeAllFiltersButtonLabel',
              defaultMessage: 'Change all filters',
            })}
            data-test-subj="showFilterActions"
          >
            <EuiIcon type="filter" className="euiQuickSelectPopover__buttonText" />
            <EuiIcon type="arrowDown" />
          </EuiSmallButtonEmpty>
        </EuiToolTip>
      }
      anchorPosition="rightUp"
      panelPaddingSize="none"
      repositionOnScroll
    >
      {renderComponent()}
      {showSaveQueryButton && (
        <EuiPopoverFooter>
          <EuiFlexGroup justifyContent="spaceAround">
            <EuiFlexItem>
              <EuiButton
                size="s"
                fill={false}
                aria-label={i18n.translate(
                  'data.search.searchBar.savedQueryPopoverSaveButtonAriaLabel',
                  {
                    defaultMessage: 'Save a new saved query',
                  }
                )}
                data-test-subj="saved-query-management-save-button"
                onClick={() => {
                  setRenderedComponent('saveQuery');
                  setShowSaveQueryButton(false);
                }}
              >
                {i18n.translate('data.search.searchBar.savedQueryPopoverSaveButtonText', {
                  defaultMessage: 'Save query',
                })}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPopoverFooter>
      )}
    </EuiPopover>
  );
};

export const FilterOptions = injectI18n(FilterOptionsUI);
