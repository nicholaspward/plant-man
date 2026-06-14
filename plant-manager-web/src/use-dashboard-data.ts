import { useEffect, useMemo, useState } from 'react';
import {
  getActionResources,
  getCareActivities,
  getCareActions,
  getCareTasks,
  getCareHistory,
  getPlants,
  getPlantCareSchedules,
  getPlantFlags,
  getPlantGroups,
  getPlantLocations,
  getPlantTaxa,
  getRecipes,
} from './api';
import type {
  ActionResource,
  CareActivity,
  CareAction,
  CareHistoryEvent,
  CareTask,
  Plant,
  PlantCareScheduleRule,
  PlantFlagDefinition,
  PlantGroup,
  PlantLocation,
  PlantTaxon,
  Recipe,
} from './domain';

export function useDashboardData() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantTaxa, setPlantTaxa] = useState<PlantTaxon[]>([]);
  const [plantLocations, setPlantLocations] = useState<PlantLocation[]>([]);
  const [plantGroups, setPlantGroups] = useState<PlantGroup[]>([]);
  const [careActions, setCareActions] = useState<CareAction[]>([]);
  const [actionResources, setActionResources] = useState<ActionResource[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [careActivities, setCareActivities] = useState<CareActivity[]>([]);
  const [plantCareSchedules, setPlantCareSchedules] = useState<PlantCareScheduleRule[]>([]);
  const [plantFlagDefinitions, setPlantFlagDefinitions] = useState<PlantFlagDefinition[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [careHistory, setCareHistory] = useState<CareHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      const [
        plantsResponse,
        tasksResponse,
        historyResponse,
        schedulesResponse,
        taxaResponse,
        locationsResponse,
        groupsResponse,
        actionsResponse,
        resourcesResponse,
        recipesResponse,
        activitiesResponse,
        flagsResponse,
      ] = await Promise.all([
        getPlants(),
        getCareTasks(),
        getCareHistory(),
        getPlantCareSchedules(),
        getPlantTaxa(),
        getPlantLocations(),
        getPlantGroups(),
        getCareActions(),
        getActionResources(),
        getRecipes(),
        getCareActivities(),
        getPlantFlags(),
      ]);

      setError(null);
      setPlants(plantsResponse);
      setCareTasks(tasksResponse);
      setCareHistory(historyResponse);
      setPlantCareSchedules(schedulesResponse);
      setPlantTaxa(taxaResponse);
      setPlantLocations(locationsResponse);
      setPlantGroups(groupsResponse);
      setCareActions(actionsResponse);
      setActionResources(resourcesResponse);
      setRecipes(recipesResponse);
      setCareActivities(activitiesResponse);
      setPlantFlagDefinitions(flagsResponse);
    } catch {
      setError('Could not reach the Plant-Man API. Start the backend and refresh.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadLocations() {
    const locationsResponse = await getPlantLocations();

    setError(null);
    setPlantLocations(locationsResponse);
  }

  async function loadGroupsAndPlants() {
    const [groupsResponse, plantsResponse] = await Promise.all([
      getPlantGroups(),
      getPlants(),
    ]);

    setError(null);
    setPlantGroups(groupsResponse);
    setPlants(plantsResponse);
  }

  async function loadPlants() {
    const plantsResponse = await getPlants();

    setError(null);
    setPlants(plantsResponse);
  }

  async function loadPlantsAndCareTasks() {
    const [plantsResponse, tasksResponse, historyResponse, schedulesResponse] = await Promise.all([
      getPlants(),
      getCareTasks(),
      getCareHistory(),
      getPlantCareSchedules(),
    ]);

    setError(null);
    setPlants(plantsResponse);
    setCareTasks(tasksResponse);
    setCareHistory(historyResponse);
    setPlantCareSchedules(schedulesResponse);
  }

  async function loadTaxaAndPlants() {
    const [plantsResponse, taxaResponse] = await Promise.all([
      getPlants(),
      getPlantTaxa(),
    ]);

    setError(null);
    setPlants(plantsResponse);
    setPlantTaxa(taxaResponse);
  }

  async function loadFlagsAndPlants() {
    const [plantsResponse, flagsResponse] = await Promise.all([
      getPlants(),
      getPlantFlags(),
    ]);

    setError(null);
    setPlants(plantsResponse);
    setPlantFlagDefinitions(flagsResponse);
  }

  async function loadCareModel() {
    const [
      plantsResponse,
      tasksResponse,
      historyResponse,
      schedulesResponse,
      actionsResponse,
      resourcesResponse,
      recipesResponse,
      activitiesResponse,
    ] = await Promise.all([
      getPlants(),
      getCareTasks(),
      getCareHistory(),
      getPlantCareSchedules(),
      getCareActions(),
      getActionResources(),
      getRecipes(),
      getCareActivities(),
    ]);

    setError(null);
    setPlants(plantsResponse);
    setCareTasks(tasksResponse);
    setCareHistory(historyResponse);
    setPlantCareSchedules(schedulesResponse);
    setCareActions(actionsResponse);
    setActionResources(resourcesResponse);
    setRecipes(recipesResponse);
    setCareActivities(activitiesResponse);
  }

  async function loadRecipesAndResources() {
    const [recipesResponse, resourcesResponse] = await Promise.all([
      getRecipes(),
      getActionResources(),
    ]);

    setError(null);
    setRecipes(recipesResponse);
    setActionResources(resourcesResponse);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadDashboard();
    });
  }, []);

  const dueCount = useMemo(
    () => careTasks.filter((task) => task.status === 'due').length,
    [careTasks],
  );

  return {
    actionResources,
    careActions,
    careActivities,
    careHistory,
    careTasks,
    dueCount,
    error,
    isLoading,
    loadDashboard,
    loadCareModel,
    loadFlagsAndPlants,
    loadGroupsAndPlants,
    loadLocations,
    loadPlants,
    loadPlantsAndCareTasks,
    loadRecipesAndResources,
    loadTaxaAndPlants,
    plantFlagDefinitions,
    plantCareSchedules,
    plantGroups,
    plantLocations,
    plantTaxa,
    plants,
    recipes,
    setError,
  };
}
