import { EuiIcon, EuiPopover, EuiSmallButtonEmpty } from '@elastic/eui';
import React, { useCallback, useState } from 'react';
import { Fragment } from 'react';
import { i18n } from '@osd/i18n';
import { SavedQueryManagementComponent } from './saved_query_management_component';
import { SavedQuery, SavedQueryService } from '../../query';

interface savedQueryManagementControlProps {
  savedQueryService: SavedQueryService;
  onLoadSavedQuery: (savedQuery: SavedQuery) => void;
  onInitiateSaveNew: () => void;
  onInitiateSave: () => void;
  // Show when user has privileges to save
  showSaveQuery?: boolean;
  savedQuery?: SavedQuery;
  onClearSavedQuery: () => void;
}

export const savedQueryManagementControl = (props: savedQueryManagementControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClosePopover = useCallback(() => setIsOpen(false), []);
  const label = i18n.translate('data.search.searchBar.savedQueryPopoverButtonText', {
    defaultMessage: 'See saved queries',
  });
  const handleTogglePopover = useCallback(() => setIsOpen((currentState) => !currentState), [
    setIsOpen,
  ]);

  const savedQueryPopoverButton = (
    <EuiSmallButtonEmpty
      onClick={handleTogglePopover}
      aria-label={label}
      data-test-subj="saved-query-management-popover-button"
      className="osdSavedQueryManagement__popoverButton"
      title={label}
    >
      <EuiIcon type="save" className="euiQuickSelectPopover__buttonText" />
    </EuiSmallButtonEmpty>
  );

  return (
    <Fragment>
      <EuiPopover
        id="savedQueryPopover"
        button={savedQueryPopoverButton}
        isOpen={isOpen}
        closePopover={handleClosePopover}
        anchorPosition="downLeft"
        panelPaddingSize="none"
        buffer={-8}
        ownFocus
        repositionOnScroll
      >
        <SavedQueryManagementComponent
          showSaveQuery={props.showSaveQuery}
          loadedSavedQuery={props.savedQuery}
          onSave={props.onInitiateSave}
          onSaveAsNew={props.onInitiateSaveNew}
          onLoad={props.onLoadSavedQuery}
          savedQueryService={props.savedQueryService}
          onClearSavedQuery={props.onClearSavedQuery}
        />
      </EuiPopover>
    </Fragment>
  );
};
