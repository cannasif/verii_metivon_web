import{ErpPagedManagementPage}from'@/features/erp-operation-management';
import{importDossierConfig,landedCostTypeConfig,tradeDossierConfig}from'@/features/erp-operation-management/configs';
export function ImportDossierManagementPage(){return <ErpPagedManagementPage config={importDossierConfig}/>}
export function LandedCostTypeManagementPage(){return <ErpPagedManagementPage config={landedCostTypeConfig}/>}
export function TradeDossierManagementPage(){return <ErpPagedManagementPage config={tradeDossierConfig}/>}
export{ImportDossierCostCreatePage}from'./ImportDossierCostCreatePage';
export{ImportDossierDetailPage}from'./ImportDossierDetailPage';
export{TradeDossierDetailPage}from'./TradeDossierDetailPage';
