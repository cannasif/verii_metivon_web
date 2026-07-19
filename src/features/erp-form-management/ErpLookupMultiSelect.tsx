import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DROPDOWN_MIN_CHARS, DROPDOWN_PAGE_SIZE } from "@/components/shared/dropdown/constants";
import { useDropdownInfiniteSearch } from "@/hooks/useDropdownInfiniteSearch";
import { api } from "@/lib/axios";
import type { PagedResponse } from "@/types/api";
import type { LookupItem } from "./types";

type LookupEnvelope={data:{items:LookupItem[];pageNumber:number;pageSize:number;totalCount:number;totalPages:number;hasPreviousPage:boolean;hasNextPage:boolean}};

export function ErpLookupMultiSelect({lookupKey,value,fallbackOptions,placeholder,searchPlaceholder,disabled,required,invalid,onChange}:{lookupKey:string;value:number[];fallbackOptions:LookupItem[];placeholder:string;searchPlaceholder:string;disabled?:boolean;required?:boolean;invalid?:boolean;onChange:(value:number[])=>void}){
  const {t}=useTranslation("erp");
  const [open,setOpen]=useState(false);
  const [searchTerm,setSearchTerm]=useState("");
  const result=useDropdownInfiniteSearch<LookupItem>({
    entityKey:["erp-lookup-multiple",lookupKey],searchTerm,enabled:open&&!disabled,minChars:DROPDOWN_MIN_CHARS,pageSize:DROPDOWN_PAGE_SIZE,
    buildFilters:()=>undefined,
    fetchPage:async({pageNumber,pageSize,search,signal})=>{const response=await api.get<LookupEnvelope>(`/api/erp-lookups/${encodeURIComponent(lookupKey)}`,{params:{pageNumber,pageSize,search},signal});const page=response.data;return{data:page.items,pageNumber:page.pageNumber,pageSize:page.pageSize,totalCount:page.totalCount,totalPages:page.totalPages,hasPreviousPage:page.hasPreviousPage,hasNextPage:page.hasNextPage}satisfies PagedResponse<LookupItem>},
  });
  const items=useMemo(()=>{const map=new Map<number,LookupItem>();fallbackOptions.filter(x=>value.includes(x.id)).forEach(x=>map.set(x.id,x));result.items.forEach(x=>map.set(x.id,x));if(searchTerm.length<DROPDOWN_MIN_CHARS)fallbackOptions.forEach(x=>map.set(x.id,x));return[...map.values()]},[fallbackOptions,result.items,searchTerm,value]);
  const selected=fallbackOptions.filter(x=>value.includes(x.id));
  const toggle=(id:number)=>onChange(value.includes(id)?value.filter(x=>x!==id):[...value,id]);
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><Button type="button" variant="outline" role="combobox" aria-expanded={open} aria-required={required} aria-invalid={invalid} disabled={disabled} className="h-auto min-h-10 w-full justify-between font-normal">
      <span className="min-w-0 truncate text-start">{selected.length===0?placeholder:selected.length===1?`${selected[0].code} · ${selected[0].name}`:t("common.selectedCount",{count:selected.length,defaultValue:`${selected.length} seçim`})}</span><ChevronsUpDown className="ms-2 size-4 shrink-0 opacity-50"/>
    </Button></PopoverTrigger>
    <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
      <Command shouldFilter={false}><CommandInput placeholder={searchPlaceholder} value={searchTerm} onValueChange={setSearchTerm}/><CommandList><CommandEmpty>{result.isLoading?t("common.loading"):t("common.empty")}</CommandEmpty><CommandGroup>
        {items.map(item=><CommandItem key={item.id} value={String(item.id)} onSelect={()=>toggle(item.id)}><Checkbox checked={value.includes(item.id)} aria-label={item.name}/><span className="min-w-0 flex-1 truncate"><strong>{item.code}</strong> · {item.name}</span>{value.includes(item.id)?<Check className="size-4"/>:null}</CommandItem>)}
        {result.hasNextPage?<CommandItem value="__more" onSelect={()=>void result.fetchNextPage()} disabled={result.isFetchingNextPage}>{result.isFetchingNextPage?<Loader2 className="size-4 animate-spin"/>:null}{t("common.loadMore",{defaultValue:"Daha fazla yükle"})}</CommandItem>:null}
      </CommandGroup></CommandList></Command>
    </PopoverContent>
  </Popover>;
}
