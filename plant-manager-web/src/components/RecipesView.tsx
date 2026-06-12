import { useMemo, useState } from 'react';
import type { ActionResource, Recipe } from '../domain';
import type { RecipeFormState } from '../form-state';
import { CatalogFilterSection, EntityList, RecordActions, SummaryActionButton, SummaryStrip } from './Ui';

type RecipesViewProps = {
  activeRecipeName?: string;
  error: string | null;
  form: RecipeFormState;
  isEditorOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  recipes: Recipe[];
  resources: ActionResource[];
  selectedRecipe?: Recipe;
  onCancel: () => void;
  onCloseDetail: () => void;
  onDelete: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onFieldChange: <Field extends keyof RecipeFormState>(
    field: Field,
    value: RecipeFormState[Field],
  ) => void;
  onNew: () => void;
  onOpenDetail: (recipe: Recipe) => void;
  onSave: () => void;
};

export function RecipesView({
  activeRecipeName,
  error,
  form,
  isEditorOpen,
  isLoading,
  isSaving,
  recipes,
  resources,
  selectedRecipe,
  onCancel,
  onCloseDetail,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onOpenDetail,
  onSave,
}: RecipesViewProps) {
  const [calculatorAmounts, setCalculatorAmounts] = useState<Record<number, string>>({});
  const [filterQuery, setFilterQuery] = useState('');
  const filteredRecipes = useMemo(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query) {
      return recipes;
    }

    return recipes.filter((recipe) =>
      `${recipe.name} ${formatMeasurementMode(recipe.measurementMode)} ${formatRecipeSummary(recipe)}`
        .toLowerCase()
        .includes(query)
    );
  }, [filterQuery, recipes]);

  function updateComponent(index: number, nextComponent: RecipeFormState['components'][number]) {
    onFieldChange(
      'components',
      form.components.map((component, componentIndex) => componentIndex === index ? nextComponent : component),
    );
  }

  function addComponent() {
    const shouldSetAsBase = form.measurementMode === 'bakers_percent'
      && getBakersBaseIndex(form.components) === -1;

    onFieldChange('components', [
      ...form.components,
      { actionResourceId: '', quantity: shouldSetAsBase ? '100' : '', unit: '', notes: '' },
    ]);
  }

  function updateMeasurementMode(nextMode: RecipeFormState['measurementMode']) {
    if (nextMode === 'bakers_percent' && form.components.length > 0 && getBakersBaseIndex(form.components) === -1) {
      onFieldChange(
        'components',
        form.components.map((component, index) => index === 0 ? { ...component, quantity: '100' } : component),
      );
    }

    onFieldChange('measurementMode', nextMode);
  }

  function setBakersBase(componentIndex: number) {
    onFieldChange(
      'components',
      form.components.map((component, index) => index === componentIndex
        ? { ...component, quantity: '100' }
        : component.quantity.trim() === '100'
          ? { ...component, quantity: '' }
          : component),
    );
  }

  function hasIncompleteComponents() {
    if (form.components.some((component) => !component.actionResourceId)) {
      return true;
    }

    if (form.measurementMode === 'quantity') {
      return false;
    }

    if (form.measurementMode === 'total_percent') {
      if (form.components.some((component) => !component.quantity.trim())) {
        return true;
      }

      return getPercentTotal(form) !== 100;
    }

    const baseIndex = getBakersBaseIndex(form.components);

    return baseIndex === -1
      || form.components.some((component, index) =>
        index !== baseIndex && (!component.quantity.trim() || Number(component.quantity) === 100)
      );
  }

  const isPercentRecipe = form.measurementMode !== 'quantity';
  const amountHeading = getAmountHeading(form.measurementMode);
  const selectedRecipeCalculatorAmount = selectedRecipe
    ? calculatorAmounts[selectedRecipe.id] ?? ''
    : '';

  return (
    <>
      <SummaryStrip
        ariaLabel="Recipes summary"
        action={<SummaryActionButton onClick={onNew}>New</SummaryActionButton>}
      >
        <p>{error ?? 'Build reusable mixes and solutions, then create the resource they produce.'}</p>
      </SummaryStrip>

      <CatalogFilterSection
        value={filterQuery}
        placeholder="Search recipes"
        onChange={setFilterQuery}
      />

      <EntityList
        ariaLabel="Recipes"
        emptyMessage={recipes.length === 0 ? 'No recipes yet.' : 'No recipes match this search.'}
        getKey={(recipe) => recipe.id}
        isLoading={isLoading}
        items={filteredRecipes}
        renderActions={(recipe) => (
          <RecordActions
            deleteLabel={`Delete ${recipe.name}`}
            editLabel={`Edit ${recipe.name}`}
            viewLabel={`View ${recipe.name}`}
            onDelete={() => onDelete(recipe)}
            onEdit={() => onEdit(recipe)}
            onView={() => onOpenDetail(recipe)}
          />
        )}
        renderContent={(recipe) => (
          <>
            <h3>{recipe.name}</h3>
            <p>{formatMeasurementMode(recipe.measurementMode)} - {formatRecipeSummary(recipe)}</p>
          </>
        )}
      />

      {selectedRecipe && !isEditorOpen ? (
        <section className="work-panel" aria-labelledby="recipe-detail-heading">
          <div className="section-heading">
            <div>
              <h2 id="recipe-detail-heading">{selectedRecipe.name}</h2>
            </div>
            <div className="row-actions">
              <button className="icon-button compact" type="button" aria-label={`Edit ${selectedRecipe.name}`} onClick={() => onEdit(selectedRecipe)}>
                Edit
              </button>
              <button className="icon-button compact" type="button" aria-label="Close recipe detail" onClick={onCloseDetail}>
                Close
              </button>
            </div>
          </div>
          <div className="plant-detail-meta compact-meta">
            <div>
              <span>Mode</span>
              <strong>{formatMeasurementMode(selectedRecipe.measurementMode)}</strong>
            </div>
            <div>
              <span>Output resource</span>
              <strong>{selectedRecipe.outputResource?.name ?? 'None'}</strong>
            </div>
            <div>
              <span>Components</span>
              <strong>{selectedRecipe.components.length}</strong>
            </div>
            <div className="meta-wide">
              <span>Procedure</span>
              <strong className="preserve-lines">{selectedRecipe.notes ?? 'No procedure'}</strong>
            </div>
          </div>
          <RecipeDetailTable
            amount={selectedRecipeCalculatorAmount}
            recipe={selectedRecipe}
            onAmountChange={(nextAmount) => setCalculatorAmounts((current) => ({
              ...current,
              [selectedRecipe.id]: nextAmount,
            }))}
          />
        </section>
      ) : null}

      {isEditorOpen ? (
        <section className="work-panel" aria-labelledby="recipe-editor-heading">
          <div className="section-heading">
            <div>
              <h2 id="recipe-editor-heading">{activeRecipeName ?? 'New recipe'}</h2>
            </div>
            <button className="icon-button compact" type="button" aria-label="Close panel" onClick={onCancel}>
              Close
            </button>
          </div>

          <div className="plant-form">
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => onFieldChange('name', event.target.value)}
              />
            </label>
            <label>
              Mode
              <select
                value={form.measurementMode}
                onChange={(event) => updateMeasurementMode(event.target.value as RecipeFormState['measurementMode'])}
              >
                <option value="quantity">Quantity</option>
                <option value="total_percent">Percent of total</option>
                <option value="bakers_percent">Percent of base</option>
              </select>
            </label>
            <label>
              Produced resource
              <input
                value={form.outputResourceName}
                onChange={(event) => onFieldChange('outputResourceName', event.target.value)}
              />
            </label>
            <fieldset className="resource-picker schedule-picker">
              <legend>Components</legend>

              {form.components.length === 0 ? (
                <p className="empty-state">No components configured.</p>
              ) : (
                <div className={`activity-resource-header recipe-resource-header ${getRecipeResourceRowClass(form.measurementMode)}`} aria-hidden="true">
                  {form.measurementMode === 'bakers_percent' ? <span>Base</span> : null}
                  <span>Resource</span>
                  {isPercentRecipe ? <span>{amountHeading}</span> : <span>{amountHeading}</span>}
                  {isPercentRecipe ? null : <span>Unit</span>}
                  <span>Notes</span>
                  <span />
                </div>
              )}

              {form.components.map((component, componentIndex) => {
                const selectedResourceIds = new Set(
                  form.components
                    .filter((_, index) => index !== componentIndex)
                    .map((item) => item.actionResourceId),
                );
                const baseIndex = getBakersBaseIndex(form.components);
                const isBakersBase = form.measurementMode === 'bakers_percent' && componentIndex === baseIndex;

                return (
                  <div className={`activity-resource-row recipe-resource-row ${getRecipeResourceRowClass(form.measurementMode)}`} key={`${component.actionResourceId}-${componentIndex}`}>
                    {form.measurementMode === 'bakers_percent' ? (
                      <label className="recipe-base-radio">
                        <input
                          checked={isBakersBase}
                          type="radio"
                          name="recipe-base-component"
                          onChange={() => setBakersBase(componentIndex)}
                        />
                        <span className="sr-only">Base component</span>
                      </label>
                    ) : null}
                    <select
                      aria-label="Component resource"
                      value={component.actionResourceId}
                      onChange={(event) => updateComponent(
                        componentIndex,
                        { ...component, actionResourceId: event.target.value },
                      )}
                    >
                      <option value="">Select a resource</option>
                      {resources
                        .filter((resource) => !selectedResourceIds.has(String(resource.id)))
                        .map((resource) => (
                          <option key={resource.id} value={resource.id}>
                            {resource.name}
                          </option>
                        ))}
                    </select>
                    <input
                      aria-label={amountHeading}
                      disabled={isBakersBase}
                      min="0"
                      step="0.01"
                      type="number"
                      value={isBakersBase ? '100' : component.quantity}
                      onChange={(event) => updateComponent(
                        componentIndex,
                        { ...component, quantity: event.target.value },
                      )}
                    />
                    {isPercentRecipe ? null : (
                      <input
                        aria-label="Unit"
                        value={component.unit}
                        onChange={(event) => updateComponent(
                          componentIndex,
                          { ...component, unit: event.target.value },
                        )}
                      />
                    )}
                    <input
                      aria-label="Component notes"
                      value={component.notes}
                      onChange={(event) => updateComponent(
                        componentIndex,
                        { ...component, notes: event.target.value },
                      )}
                    />
                    <button
                      className="icon-button compact danger"
                      type="button"
                      aria-label="Remove component"
                      onClick={() => onFieldChange(
                        'components',
                        form.components.filter((_, index) => index !== componentIndex),
                      )}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}

              <button
                className="small-action"
                type="button"
                disabled={resources.length === 0}
                onClick={addComponent}
              >
                Add component
              </button>
              {form.measurementMode === 'total_percent' ? (
                <p className="schedule-hint">Total: {getPercentTotal(form)}%</p>
              ) : null}
            </fieldset>
            <label className="form-wide">
              Procedure
              <textarea
                value={form.notes}
                onChange={(event) => onFieldChange('notes', event.target.value)}
              />
            </label>
          </div>

          <div className="form-actions">
            <button className="primary-action" type="button" disabled={isSaving || !form.outputResourceName.trim() || form.components.length === 0 || hasIncompleteComponents()} onClick={onSave}>
              {isSaving ? 'Saving' : 'Save'}
            </button>
            <button className="text-button" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </section>
      ) : null}

    </>
  );
}

function formatRecipeSummary(recipe: Recipe) {
  if (recipe.components.length === 0) {
    return 'No components';
  }

  return recipe.components
    .map((component) => `${component.name}${formatComponentAmount(component.quantity, component.unit, recipe.measurementMode, true)}`)
    .join(', ');
}

function RecipeDetailTable({
  amount,
  recipe,
  onAmountChange,
}: {
  amount: string;
  recipe: Recipe;
  onAmountChange: (amount: string) => void;
}) {
  if (recipe.components.length === 0) {
    return (
      <div className="detail-list">
        <p className="empty-state">No components configured.</p>
      </div>
    );
  }

  const sortedComponents = [...recipe.components].sort((left, right) => {
    if (recipe.measurementMode === 'bakers_percent') {
      if (left.quantity === 100 && right.quantity !== 100) {
        return -1;
      }

      if (right.quantity === 100 && left.quantity !== 100) {
        return 1;
      }
    }

    return left.sortOrder - right.sortOrder;
  });
  const baseComponent = sortedComponents.find((component) => component.quantity === 100);
  const numericAmount = Number(amount);
  const canCalculate = amount.trim() !== '' && Number.isFinite(numericAmount);

  if (recipe.measurementMode === 'quantity') {
    return (
      <div className="recipe-table" role="table" aria-label="Recipe components">
        <div className="recipe-table-row recipe-table-heading" role="row">
          <span role="columnheader">Ingredient / Resource</span>
          <span role="columnheader">Quantity</span>
          <span role="columnheader">Notes</span>
        </div>
        {sortedComponents.map((component) => (
          <div className="recipe-table-row" role="row" key={component.actionResourceId}>
            <span role="cell">{component.name}</span>
            <span role="cell">{formatComponentAmount(component.quantity, component.unit, recipe.measurementMode)}</span>
            <span role="cell">{component.notes ?? 'No notes'}</span>
          </div>
        ))}
      </div>
    );
  }

  if (recipe.measurementMode === 'total_percent') {
    return (
      <div className="recipe-calculator">
        <label className="recipe-calculator-input">
          Total amount
          <input
            min="0"
            step="0.01"
            type="number"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
          />
        </label>
        <PercentRecipeTable
          getCalculatedAmount={(component) => canCalculate && component.quantity !== null
            ? numericAmount * (component.quantity / 100)
            : null}
          recipe={recipe}
          components={sortedComponents}
        />
      </div>
    );
  }

  return (
    <div className="recipe-calculator">
      <div className="recipe-table" role="table" aria-label="Recipe calculator">
        <div className="recipe-table-row recipe-table-heading" role="row">
          <span role="columnheader">Ingredient / Resource</span>
          <span role="columnheader">Percent</span>
          <span role="columnheader">Amount</span>
        </div>
        {sortedComponents.map((component) => {
          const isBase = baseComponent?.actionResourceId === component.actionResourceId;
          const calculatedAmount = canCalculate && component.quantity !== null
            ? numericAmount * (component.quantity / 100)
            : null;

          return (
            <div className="recipe-table-row" role="row" key={component.actionResourceId}>
              <span role="cell">{component.name}</span>
              <span role="cell">{formatComponentAmount(component.quantity, component.unit, recipe.measurementMode)}</span>
              <span role="cell">
                {isBase ? (
                  <input
                    aria-label={`${component.name} base amount`}
                    min="0"
                    step="0.01"
                    type="number"
                    value={amount}
                    onChange={(event) => onAmountChange(event.target.value)}
                  />
                ) : formatCalculatedAmount(calculatedAmount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PercentRecipeTable({
  components,
  getCalculatedAmount,
  recipe,
}: {
  components: Recipe['components'];
  getCalculatedAmount: (component: Recipe['components'][number]) => number | null;
  recipe: Recipe;
}) {
  return (
    <div className="recipe-table" role="table" aria-label="Recipe calculator">
      <div className="recipe-table-row recipe-table-heading" role="row">
        <span role="columnheader">Ingredient / Resource</span>
        <span role="columnheader">Percent</span>
        <span role="columnheader">Amount</span>
      </div>
      {components.map((component) => (
        <div className="recipe-table-row" role="row" key={component.actionResourceId}>
          <span role="cell">{component.name}</span>
          <span role="cell">{formatComponentAmount(component.quantity, component.unit, recipe.measurementMode)}</span>
          <span role="cell">{formatCalculatedAmount(getCalculatedAmount(component))}</span>
        </div>
      ))}
    </div>
  );
}

function formatComponentAmount(
  quantity: number | null,
  unit: string | null,
  measurementMode: Recipe['measurementMode'],
  compact = false,
) {
  if (quantity === null) {
    return compact ? '' : 'No value';
  }

  const suffix = measurementMode === 'quantity'
    ? unit ? ` ${unit}` : ''
    : '%';

  return `${compact ? ' (' : ''}${quantity}${suffix}${compact ? ')' : ''}`;
}

function formatMeasurementMode(measurementMode: Recipe['measurementMode']) {
  switch (measurementMode) {
    case 'total_percent':
      return 'Percent of total';
    case 'bakers_percent':
      return 'Percent of base';
    default:
      return 'Quantity';
  }
}

function getAmountHeading(measurementMode: RecipeFormState['measurementMode']) {
  switch (measurementMode) {
    case 'total_percent':
      return '% of total';
    case 'bakers_percent':
      return '% of base';
    default:
      return 'Qty';
  }
}

function getRecipeResourceRowClass(measurementMode: RecipeFormState['measurementMode']) {
  switch (measurementMode) {
    case 'bakers_percent':
      return 'recipe-resource-row-base';
    case 'total_percent':
      return 'recipe-resource-row-percent';
    default:
      return '';
  }
}

function getBakersBaseIndex(components: RecipeFormState['components']) {
  return components.findIndex((component) => Number(component.quantity) === 100);
}

function getPercentTotal(form: RecipeFormState) {
  return form.components.reduce((total, component) => total + Number(component.quantity || 0), 0);
}

function formatCalculatedAmount(amount: number | null) {
  if (amount === null) {
    return '';
  }

  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}
