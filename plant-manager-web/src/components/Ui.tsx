import type { ReactNode } from 'react';

type SummaryStripProps = {
  action?: ReactNode;
  ariaLabel: string;
  children: ReactNode;
};

export function SummaryStrip({ action, ariaLabel, children }: SummaryStripProps) {
  return (
    <section className="summary-panel" aria-label={ariaLabel}>
      <div>
        {children}
      </div>
      {action}
    </section>
  );
}

type EntityListProps<Item> = {
  ariaLabel: string;
  emptyMessage: string;
  isLoading: boolean;
  items: Item[];
  getKey: (item: Item) => string | number;
  renderActions?: (item: Item) => ReactNode;
  renderContent: (item: Item) => ReactNode;
};

export function EntityList<Item>({
  ariaLabel,
  emptyMessage,
  getKey,
  isLoading,
  items,
  renderActions,
  renderContent,
}: EntityListProps<Item>) {
  return (
    <section className="work-panel" aria-label={ariaLabel}>
      <div className="plant-list">
        {!isLoading && items.length === 0 ? (
          <p className="empty-state">{emptyMessage}</p>
        ) : null}

        {items.map((item) => (
          <article className="plant-row" key={getKey(item)}>
            <div>
              {renderContent(item)}
            </div>
            {renderActions ? (
              <div className="row-actions">
                {renderActions(item)}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

type CatalogFilterSectionProps = {
  label?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function CatalogFilterSection({
  label = 'Search',
  onChange,
  placeholder = 'Search catalog',
  value,
}: CatalogFilterSectionProps) {
  return (
    <section className="work-panel" aria-label="Catalog filter">
      <div className="search-row">
        <label>
          {label}
          <input
            type="search"
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}

type SummaryActionButtonProps = {
  children: ReactNode;
  onClick: () => void;
};

export function SummaryActionButton({ children, onClick }: SummaryActionButtonProps) {
  return (
    <button className="primary-action" type="button" onClick={onClick}>
      {children}
    </button>
  );
}

type DetailActionsProps = {
  editLabel: string;
  closeLabel: string;
  onClose: () => void;
  onEdit: () => void;
};

export function DetailActions({ closeLabel, editLabel, onClose, onEdit }: DetailActionsProps) {
  return (
    <div className="row-actions">
      <button className="icon-button compact" type="button" aria-label={editLabel} onClick={onEdit}>
        Edit
      </button>
      <button className="icon-button compact" type="button" aria-label={closeLabel} onClick={onClose}>
        Close
      </button>
    </div>
  );
}

type RecordActionsProps = {
  deleteLabel: string;
  editLabel: string;
  onDelete: () => void;
  onEdit: () => void;
  onView?: () => void;
  viewLabel?: string;
};

export function RecordActions({
  deleteLabel,
  editLabel,
  onDelete,
  onEdit,
  onView,
  viewLabel,
}: RecordActionsProps) {
  return (
    <>
      {onView ? (
        <button className="icon-button compact" type="button" aria-label={viewLabel} onClick={onView}>
          View
        </button>
      ) : null}
      <button className="icon-button compact" type="button" aria-label={editLabel} onClick={onEdit}>
        Edit
      </button>
      <button className="icon-button compact danger" type="button" aria-label={deleteLabel} onClick={onDelete}>
        Delete
      </button>
    </>
  );
}

type ClosePanelButtonProps = {
  onClick: () => void;
};

export function ClosePanelButton({ onClick }: ClosePanelButtonProps) {
  return (
    <button className="icon-button compact" type="button" aria-label="Close panel" onClick={onClick}>
      Close
    </button>
  );
}
