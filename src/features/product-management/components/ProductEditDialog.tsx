import {useEffect,useState,type ReactElement} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {productApi} from '../api/product-api';
import type {SaveProductRequest} from '../types/product.types';

export function ProductEditDialog({id,open,onOpenChange}:{id:number|null;open:boolean;onOpenChange:(value:boolean)=>void}):ReactElement{
 const client=useQueryClient();const[saving,setSaving]=useState(false);const[form,setForm]=useState<SaveProductRequest|null>(null);
 const definitions=useQuery({queryKey:['product-definitions'],queryFn:productApi.getDefinitions,enabled:open});
 const detail=useQuery({queryKey:['product-detail',id],queryFn:()=>productApi.getById(id!),enabled:open&&Boolean(id),refetchOnMount:'always'});
 useEffect(()=>{if(detail.data?.data)setForm(detail.data.data)},[detail.dataUpdatedAt,detail.data]);
 const set=<K extends keyof SaveProductRequest>(key:K,value:SaveProductRequest[K])=>setForm(current=>current?{...current,[key]:value}:current);
 const save=async()=>{if(!id||!form)return;try{setSaving(true);await productApi.update(id,form);toast.success('Ürün güncellendi.');await client.invalidateQueries({queryKey:['products']});onOpenChange(false)}catch(error){toast.error(error instanceof Error?error.message:'Ürün güncellenemedi.')}finally{setSaving(false)}};
 const d=definitions.data?.data;
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto lg:max-w-4xl"><DialogHeader><DialogTitle>Stok / Ürün Kartını Düzenle</DialogTitle><DialogDescription>Kaydedilmiş ürün ana verisini güncelleyin. Önceki değerler sunucudan yeniden okunur.</DialogDescription></DialogHeader>{!form||detail.isLoading?<div className="p-10 text-center text-sm text-muted-foreground">Ürün bilgileri yükleniyor...</div>:<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 <Field label="Ürün Kodu"><Input value={form.code} onChange={e=>set('code',e.target.value)} required/></Field><Field label="Ürün Adı"><Input value={form.name} onChange={e=>set('name',e.target.value)} required/></Field><Field label="Arama Adı"><Input value={form.searchName??''} onChange={e=>set('searchName',e.target.value)}/></Field>
 <Select label="Kategori" value={form.productCategoryId} options={d?.categories} onChange={v=>set('productCategoryId',v)}/><Select label="Ürün Grubu" value={form.productGroupId} options={d?.groups} onChange={v=>set('productGroupId',v)}/><Select label="Marka" value={form.brandId??0} options={d?.brands} optional onChange={v=>set('brandId',v||null)}/>
 <Select label="Temel Birim" value={form.baseUnitId} options={d?.units} onChange={v=>set('baseUnitId',v)}/><Select label="Alış Vergi Grubu" value={form.purchaseTaxGroupId} options={d?.taxGroups} onChange={v=>set('purchaseTaxGroupId',v)}/><Select label="Satış Vergi Grubu" value={form.salesTaxGroupId} options={d?.taxGroups} onChange={v=>set('salesTaxGroupId',v)}/>
 <Field label="Ürün Tipi"><Input type="number" min={1} value={form.productType} onChange={e=>set('productType',Number(e.target.value))}/></Field><Field label="Takip Tipi"><Input type="number" min={0} max={2} value={form.trackingType} onChange={e=>set('trackingType',Number(e.target.value))}/></Field><Field label="Tedarik Tipi"><Input type="number" min={1} value={form.procurementType} onChange={e=>set('procurementType',Number(e.target.value))}/></Field>
 <Field label="Menşei Ülke"><Input maxLength={2} value={form.countryOfOriginCode??''} onChange={e=>set('countryOfOriginCode',e.target.value)}/></Field><Field label="GTİP"><Input value={form.customsTariffCode??''} onChange={e=>set('customsTariffCode',e.target.value)}/></Field><Field label="Üretici Kodu"><Input value={form.manufacturerCode??''} onChange={e=>set('manufacturerCode',e.target.value)}/></Field>
 <div className="md:col-span-2 lg:col-span-3"><Field label="Açıklama"><Textarea value={form.description??''} onChange={e=>set('description',e.target.value)}/></Field></div>
 <Check label="Satın Alınabilir" checked={form.isPurchasable} onChange={v=>set('isPurchasable',v)}/><Check label="Satılabilir" checked={form.isSellable} onChange={v=>set('isSellable',v)}/><Check label="Stok Takibi" checked={form.isInventoryTracked} onChange={v=>set('isInventoryTracked',v)}/>
 </div>}<DialogFooter><Button variant="outline" onClick={()=>onOpenChange(false)}>Vazgeç</Button><Button disabled={!form||saving} onClick={()=>void save()}>{saving?'Kaydediliyor...':'Değişiklikleri Kaydet'}</Button></DialogFooter></DialogContent></Dialog>;
}
function Field({label,children}:{label:string;children:ReactElement}){return <div className="space-y-2"><Label>{label}</Label>{children}</div>}
function Select({label,value,options,optional,onChange}:{label:string;value:number;options?:Array<{id:number;code:string;name:string}>;optional?:boolean;onChange:(value:number)=>void}){return <Field label={label}><select className="h-10 rounded-md border bg-background px-3" value={value} onChange={e=>onChange(Number(e.target.value))}>{optional?<option value={0}>Seçiniz</option>:null}{options?.map(x=><option key={x.id} value={x.id}>{x.code} · {x.name}</option>)}</select></Field>}
function Check({label,checked,onChange}:{label:string;checked:boolean;onChange:(value:boolean)=>void}){return <label className="flex items-center gap-2 rounded-md border p-3 text-sm"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/>{label}</label>}
