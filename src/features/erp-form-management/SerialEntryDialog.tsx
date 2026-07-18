import {useMemo,useRef,useState,type ChangeEvent,type ReactElement} from "react";
import {Barcode,FileUp,ListPlus,ScanLine,Trash2} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Dialog,DialogContent,DialogFooter,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import type {LookupItem} from "./types";

const tokens=(value:string)=>Array.from(new Set(value.split(/[\r\n,;\t]+/).map(x=>x.trim()).filter(Boolean)));
const serialize=(values:string[])=>values.join("\n");
export type Gs1ScanData={gtin?:string;lotNumber?:string;serialNumber?:string;manufactureDate?:string;expiryDate?:string};
const gs1Date=(value:string)=>/^\d{6}$/.test(value)?`20${value.slice(0,2)}-${value.slice(2,4)}-${value.slice(4,6)}`:undefined;

export const parseGs1=(raw:string):Gs1ScanData|null=>{
  const value=raw.trim().replace(/^]d2/i,"");const fields:Record<string,string>={};
  if(value.includes("(")){for(const match of value.matchAll(/\((\d{2,4})\)([^()]*)/g))fields[match[1]]=match[2].trim();}
  else{const input=value;const groupSeparator=String.fromCharCode(29);let i=0;while(i<input.length){const ai=input.slice(i,i+2);i+=2;if(ai==="01"){fields[ai]=input.slice(i,i+14);i+=14;}else if(ai==="11"||ai==="17"){fields[ai]=input.slice(i,i+6);i+=6;}else if(ai==="10"||ai==="21"){const end=input.indexOf(groupSeparator,i);fields[ai]=input.slice(i,end<0?undefined:end);i=end<0?input.length:end+1;}else return null;}}
  if(!fields["01"]&&!fields["10"]&&!fields["17"]&&!fields["21"])return null;
  return{gtin:fields["01"],lotNumber:fields["10"],serialNumber:fields["21"],manufactureDate:gs1Date(fields["11"]??""),expiryDate:gs1Date(fields["17"]??"")};
};

export function SerialEntryDialog({value,onChange,expectedQuantity,inventoryOptions,onGs1Data,invalid}:{value:string;onChange:(value:string)=>void;expectedQuantity?:number;inventoryOptions?:LookupItem[];onGs1Data?:(data:Gs1ScanData)=>void;invalid?:boolean}):ReactElement{
  const{t}=useTranslation("erp");const[open,setOpen]=useState(false);const[draft,setDraft]=useState<string[]>(()=>tokens(value));const[scan,setScan]=useState("");const[rangeStart,setRangeStart]=useState("");const[rangeCount,setRangeCount]=useState(expectedQuantity||1);const[search,setSearch]=useState("");const[lastGs1,setLastGs1]=useState<Gs1ScanData|null>(null);const scanRef=useRef<HTMLInputElement>(null);
  const mismatch=expectedQuantity!==undefined&&expectedQuantity>=0&&draft.length!==expectedQuantity;
  const options=useMemo(()=>inventoryOptions?.filter(x=>!search||`${x.code} ${x.name}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()))??[],[inventoryOptions,search]);
  const add=(items:string[])=>setDraft(current=>Array.from(new Set([...current,...items.map(x=>x.trim()).filter(Boolean)])));
  const addScan=(raw:string)=>{const parsed=parseGs1(raw);if(parsed){setLastGs1(parsed);onGs1Data?.(parsed);if(parsed.serialNumber)add([parsed.serialNumber]);}else add([raw]);setScan("");scanRef.current?.focus()};
  const generate=()=>{const match=rangeStart.match(/^(.*?)(\d+)$/);if(!match||rangeCount<1)return;const prefix=match[1],start=Number(match[2]),width=match[2].length;add(Array.from({length:rangeCount},(_,i)=>`${prefix}${String(start+i).padStart(width,"0")}`))};
  const file=async(e:ChangeEvent<HTMLInputElement>)=>{const selected=e.target.files?.[0];if(!selected)return;add(tokens(await selected.text()));e.target.value=""};
  return <Dialog open={open} onOpenChange={next=>{setOpen(next);if(next){setDraft(tokens(value));setLastGs1(null);setTimeout(()=>scanRef.current?.focus(),50)}}}>
    <DialogTrigger asChild><Button type="button" variant="outline" aria-invalid={invalid} className="w-full justify-between"><span className="inline-flex items-center gap-2"><Barcode className="h-4 w-4"/>{t("serials.manage")}</span><span className={mismatch?"text-destructive":"text-muted-foreground"}>{draft.length}{expectedQuantity!==undefined?` / ${expectedQuantity}`:""}</span></Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{inventoryOptions?t("serials.selectTitle"):t("serials.entryTitle")}</DialogTitle></DialogHeader>
      {inventoryOptions?<div className="space-y-3"><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("serials.search")}/><div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border p-2">{options.map(option=><label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"><input type="checkbox" checked={draft.includes(String(option.id))} onChange={e=>setDraft(current=>e.target.checked?Array.from(new Set([...current,String(option.id)])):current.filter(x=>x!==String(option.id)))}/><span className="font-mono">{option.code}</span><span className="text-xs text-muted-foreground">{option.name}</span></label>)}</div></div>:<div className="space-y-5">
        <div className="space-y-2"><Label>{t("serials.scanner")}</Label><div className="flex gap-2"><Input ref={scanRef} value={scan} onChange={e=>setScan(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addScan(scan)}}} placeholder={t("serials.scanHint")}/><Button type="button" onClick={()=>addScan(scan)}><ScanLine/></Button></div><p className="text-xs text-muted-foreground">{t("serials.gs1Hint")}</p></div>
        {lastGs1?<div className="grid gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 text-sm sm:grid-cols-2"><strong className="sm:col-span-2">{t("serials.gs1Detected")}</strong>{lastGs1.gtin?<span>GTIN: <b>{lastGs1.gtin}</b></span>:null}{lastGs1.lotNumber?<span>{t("serials.lot")}: <b>{lastGs1.lotNumber}</b></span>:null}{lastGs1.expiryDate?<span>{t("serials.expiry")}: <b>{lastGs1.expiryDate}</b></span>:null}{lastGs1.serialNumber?<span>{t("serials.serial")}: <b>{lastGs1.serialNumber}</b></span>:null}</div>:null}
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]"><div><Label>{t("serials.rangeStart")}</Label><Input value={rangeStart} onChange={e=>setRangeStart(e.target.value)} placeholder="MET-000001"/></div><div><Label>{t("serials.quantity")}</Label><Input type="number" min={1} value={rangeCount} onChange={e=>setRangeCount(Number(e.target.value))}/></div><Button type="button" className="self-end" variant="secondary" onClick={generate}><ListPlus/>{t("serials.generate")}</Button></div>
        <div><Label className="mb-2 block">{t("serials.paste")}</Label><Textarea rows={5} value={serialize(draft)} onChange={e=>setDraft(tokens(e.target.value))} placeholder={t("serials.pasteHint")}/></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"><FileUp className="h-4 w-4"/>{t("serials.import")}<input className="hidden" type="file" accept=".csv,.txt,text/plain,text/csv" onChange={file}/></label>
      </div>}
      <div className={`rounded-lg border p-3 text-sm ${mismatch?"border-destructive/50 bg-destructive/5":"border-emerald-500/30 bg-emerald-500/5"}`}>{mismatch?t("serials.countMismatch",{selected:draft.length,expected:expectedQuantity}):t("serials.countValid",{count:draft.length})}</div>
      <div className="flex flex-wrap gap-2">{draft.slice(0,100).map(item=><span key={item} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-mono text-xs">{inventoryOptions?.find(x=>String(x.id)===item)?.code??item}<button type="button" onClick={()=>setDraft(x=>x.filter(v=>v!==item))}><Trash2 className="h-3 w-3"/></button></span>)}</div>
      <DialogFooter><Button type="button" variant="outline" onClick={()=>setOpen(false)}>{t("common.cancel")}</Button><Button type="button" disabled={mismatch} onClick={()=>{onChange(serialize(draft));setOpen(false)}}>{t("serials.apply")}</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}
