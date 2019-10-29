
// Models and Consts
export { AssetModel } from './_models/asset.model';
export { AssetAssignModel } from './_models/asset-assign.model';

// DataSources
export { AssetsDataSource } from './_data-sources/assets.datasource';
export { AssetAssignsDataSource } from './_data-sources/asset-assigns.datasource';

// Actions
// Asset Actions =>
export {
    AssetActionTypes,
    AssetActions,
    AssetCreated,
    AssetUpdated,
    AssetsPageRequested,
    AssetsPageLoaded,
    AssetsPageCancelled,
    AssetsPageToggleLoading,
    AssetOnServerCreated,
    AssetOnServerUpdated,
    AssetBackProcessFailed,
    OneAssetDeleted,
    AssetOnServerDeleted,
} from './_actions/asset.actions';
// AssetAssign Actions =>
export {
    AssetAssignActionTypes,
    AssetAssignActions,
    AssetAssignCreated,
    AssetAssignUpdated,
    AssetAssignsPageRequested,
    AssetAssignsPageLoaded,
    AssetAssignsPageCancelled,
    AssetAssignsPageToggleLoading,
    AssetAssignOnServerCreated,
    AssetAssignOnServerUpdated,
    AssetAssignBackProcessFailed,
    OneAssetAssignDeleted,
    AssetAssignOnServerDeleted,
} from './_actions/asset-assign.actions';

// Effects
export { AssetEffects } from './_effects/asset.effects';
export { AssetAssignEffects } from './_effects/asset-assign.effects';

// Reducers
export { assetsReducer } from './_reducers/asset.reducers';
export { assetAssignsReducer } from './_reducers/asset-assign.reducers';

// Selectors
// Asset selectors
export {
    selectAssetById,
    selectAssetsActionLoading,
    selectAssetsBackProcessingFailed,
    selectAssetsBackProcessingSuccess,
    selectAssetsInStore,
	selectLastCreatedAssetId,
} from './_selectors/asset.selectors';
// AssetAssign selectors
export {
    selectAssetAssignById,
    selectAssetAssignsActionLoading,
    selectAssetAssignsBackProcessingFailed,
    selectAssetAssignsBackProcessingSuccess,
    selectAssetAssignsInStore,
	selectLastCreatedAssetAssignId,
} from './_selectors/asset-assign.selectors';

// Services
export { AssetService,AssetAssignService  } from './_services';
