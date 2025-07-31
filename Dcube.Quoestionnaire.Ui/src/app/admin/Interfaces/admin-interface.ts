export interface Client {
  id?: number; // optional, for edit scenarios
  name: string;
  templateId: number;
  templateName: string;
  statusId: number;
  statusName: string;
  legalName: string;
  address: string;
  phoneNumber: string;
  contactPerson: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  numberOfLocations: number;
  numberOfEmployees: number;
  numberOfSuppliers: number;
  numberOfExternalPartners: number;
}
export interface ClientTemplate {
  id: number;
  createdOn: string;
  modifiedOn: string; 
  createdBy: string;
  modifiedBy: string;
  clientId: number;
  clientName: string;
  templateId: number;
  templateName: string;
  statusId: number;
  statusName: string;
  percentageCompleted: number;
}