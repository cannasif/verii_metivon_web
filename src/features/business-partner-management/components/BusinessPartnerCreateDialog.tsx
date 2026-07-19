import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/axios';
import { businessPartnerApi } from '../api/business-partner-api';
import { ErpLookupCombobox } from '@/features/erp-form-management/ErpLookupCombobox';

interface Props { open:boolean; onOpenChange:(open:boolean)=>void }
interface PartnerParameters { isAutomatic:boolean;allowManual:boolean;preview:string;requireTaxNumber:boolean;requireTaxOffice:boolean;requireEmail:boolean;requirePhone:boolean;requireNationalIdentityNumber:boolean;defaultBusinessPartnerTypeId:number|null;defaultCustomerGroupId:number|null;defaultPaymentTermId:number|null;defaultCurrencyId:number|null;defaultTaxGroupId:number|null;defaultCreditLimit:number;defaultUnlimitedCredit:boolean }
interface Envelope<T>{data:T}

export function BusinessPartnerCreateDialog({ open, onOpenChange }:Props):ReactElement {
  const queryClient = useQueryClient();
  const branch = useAuthStore((state)=>state.branch);
  const [saving,setSaving]=useState(false);
  const [unlimited,setUnlimited]=useState(false);
  const [partnerTypeId,setPartnerTypeId]=useState<number|null>(null);
  const [customerGroupId,setCustomerGroupId]=useState<number|null>(null);
  const [paymentTermId,setPaymentTermId]=useState<number|null>(null);
  const [currencyId,setCurrencyId]=useState<number|null>(null);
  const [taxGroupId,setTaxGroupId]=useState<number|null>(null);
  const definitions = useQuery({queryKey:['business-partner-definitions'],queryFn:()=>businessPartnerApi.getDefinitions(),enabled:open});
  const parameters = useQuery({queryKey:['business-partner-parameters',branch?.id],queryFn:async()=>{const response=await api.get<Envelope<PartnerParameters>>('/api/parameters/business-partners',{params:{branchId:Number(branch?.id??0)}});return response.data;},enabled:open&&Boolean(branch?.id)});
  const data=definitions.data?.data;

  const defaultValue=(items?:{id:number;isDefault:boolean}[])=>items?.find(x=>x.isDefault)?.id??null;
  useEffect(()=>{
    if(!open){setUnlimited(false);return;}
    if(!data)return;
    setPartnerTypeId(parameters.data?.defaultBusinessPartnerTypeId??defaultValue(data.partnerTypes));
    setCustomerGroupId(parameters.data?.defaultCustomerGroupId??defaultValue(data.customerGroups));
    setPaymentTermId(parameters.data?.defaultPaymentTermId??defaultValue(data.paymentTerms));
    setCurrencyId(parameters.data?.defaultCurrencyId??defaultValue(data.currencies));
    setTaxGroupId(parameters.data?.defaultTaxGroupId??defaultValue(data.taxGroups));
    setUnlimited(parameters.data?.defaultUnlimitedCredit??false);
  },[open,data,parameters.data]);
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    const number=(key:string)=>Number(form.get(key)??0);
    try{
      setSaving(true);
      await businessPartnerApi.create({
        code:String(form.get('code')??''),name:String(form.get('name')??''),legalName:String(form.get('legalName')??''),branchId:Number(branch?.id??0),
        businessPartnerTypeId:partnerTypeId??0,customerGroupId,paymentTermId:paymentTermId??0,currencyId:currencyId??0,taxGroupId:taxGroupId??0,
        taxOffice:String(form.get('taxOffice')??''),taxNumber:String(form.get('taxNumber')??''),nationalIdentityNumber:String(form.get('nationalIdentityNumber')??''),email:String(form.get('email')??''),phone:String(form.get('phone')??''),mobilePhone:String(form.get('mobilePhone')??''),website:String(form.get('website')??''),creditLimit:number('creditLimit'),hasUnlimitedCredit:unlimited,notes:String(form.get('notes')??'')
      });
      toast.success('Cari başarıyla oluşturuldu.');
      await queryClient.invalidateQueries({queryKey:['business-partners']});
      onOpenChange(false);
    }catch(error){ toast.error(error instanceof Error?error.message:'Cari oluşturulamadı.'); }finally{setSaving(false);}
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="lg:max-w-4xl"><DialogHeader><DialogTitle>Yeni Cari Kartı</DialogTitle><DialogDescription>Cari temel, mali ve iletişim bilgilerini tanımlayın.</DialogDescription></DialogHeader>
    <form onSubmit={submit} className="space-y-6"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Field label="Cari Kodu" required={!parameters.data?.isAutomatic}><div><Input name="code" required={!parameters.data?.isAutomatic} disabled={parameters.data?.isAutomatic&&!parameters.data?.allowManual} maxLength={50} placeholder={parameters.data?.isAutomatic?parameters.data.preview:undefined}/>{parameters.data?.isAutomatic?<p className="mt-1 text-xs text-muted-foreground">Boş bırakılırsa sıradaki kod otomatik üretilir: <span className="font-mono font-semibold">{parameters.data.preview}</span></p>:null}</div></Field><Field label="Cari Adı" required><Input name="name" required maxLength={200}/></Field><Field label="Ticari Unvan"><Input name="legalName" maxLength={250}/></Field>
      <Field label="Cari Tipi" required><ErpLookupCombobox lookupKey="businesspartnertypes" value={String(partnerTypeId??'')} fallbackOptions={data?.partnerTypes??[]} placeholder="Cari tipi seçin" searchPlaceholder="Cari tiplerinde ara..." required onChange={value=>setPartnerTypeId(value===''?null:value)}/></Field>
      <Field label="Cari Grubu"><ErpLookupCombobox lookupKey="customergroups" value={String(customerGroupId??'')} fallbackOptions={data?.customerGroups??[]} placeholder="Cari grubu seçin" searchPlaceholder="Cari gruplarında ara..." onChange={value=>setCustomerGroupId(value===''?null:value)}/></Field>
      <Field label="Ödeme Koşulu" required><ErpLookupCombobox lookupKey="paymentterms" value={String(paymentTermId??'')} fallbackOptions={data?.paymentTerms??[]} placeholder="Ödeme koşulu seçin" searchPlaceholder="Ödeme koşullarında ara..." required onChange={value=>setPaymentTermId(value===''?null:value)}/></Field>
      <Field label="Para Birimi" required><ErpLookupCombobox lookupKey="currencies" value={String(currencyId??'')} fallbackOptions={data?.currencies??[]} placeholder="Para birimi seçin" searchPlaceholder="Para birimlerinde ara..." required onChange={value=>setCurrencyId(value===''?null:value)}/></Field>
      <Field label="Vergi Grubu" required><ErpLookupCombobox lookupKey="taxgroups" value={String(taxGroupId??'')} fallbackOptions={data?.taxGroups??[]} placeholder="Vergi grubu seçin" searchPlaceholder="Vergi gruplarında ara..." required onChange={value=>setTaxGroupId(value===''?null:value)}/></Field>
      <Field label="Vergi Dairesi" required={parameters.data?.requireTaxOffice}><Input name="taxOffice" required={parameters.data?.requireTaxOffice}/></Field><Field label="Vergi Numarası" required={parameters.data?.requireTaxNumber}><Input name="taxNumber" required={parameters.data?.requireTaxNumber} maxLength={10} inputMode="numeric"/></Field><Field label="T.C. Kimlik No" required={parameters.data?.requireNationalIdentityNumber}><Input name="nationalIdentityNumber" maxLength={11} required={parameters.data?.requireNationalIdentityNumber}/></Field>
      <Field label="E-posta" required={parameters.data?.requireEmail}><Input name="email" type="email" required={parameters.data?.requireEmail}/></Field><Field label="Telefon / Cep Telefonu" required={parameters.data?.requirePhone}><Input name="phone" /></Field><Field label="Cep Telefonu"><Input name="mobilePhone"/></Field><Field label="Web Sitesi"><Input name="website" type="url"/></Field>
      <Field label="Kredi Limiti"><Input key={`credit-${parameters.data?.defaultCreditLimit??0}`} name="creditLimit" type="number" min="0" step="0.01" defaultValue={parameters.data?.defaultCreditLimit??0} disabled={unlimited}/></Field>
      <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium"><input type="checkbox" checked={unlimited} onChange={e=>setUnlimited(e.target.checked)} className="h-4 w-4"/>Sınırsız kredi</label>
      <div className="md:col-span-2 lg:col-span-3"><Field label="Notlar"><Textarea name="notes" rows={3}/></Field></div>
    </div><DialogFooter><Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Vazgeç</Button><Button type="submit" disabled={saving||definitions.isLoading}>{saving?'Kaydediliyor...':'Cariyi Kaydet'}</Button></DialogFooter></form>
  </DialogContent></Dialog>;
}

function Field({label,required,children}:{label:string;required?:boolean;children:ReactElement}):ReactElement{return <div className="space-y-2"><Label>{label}{required?<span className="text-destructive"> *</span>:null}</Label>{children}</div>}
