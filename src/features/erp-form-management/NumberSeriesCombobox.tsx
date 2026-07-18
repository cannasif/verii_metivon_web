import {useMemo,useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {VoiceSearchCombobox} from "@/components/shared/VoiceSearchCombobox";
import {api} from "@/lib/axios";
type Row={id:number;code:string;name:string;format:string;isDefault:boolean};
type Envelope={data:Row[]};
export function NumberSeriesCombobox({module,reference,branchId,warehouseId,value,onChange,placeholder,invalid}:{module:string;reference:string;branchId?:number;warehouseId?:number;value:string;onChange:(value:number|"")=>void;placeholder:string;invalid?:boolean}){
 const[search,setSearch]=useState("");const query=useQuery({queryKey:["number-series-available",module,reference,branchId,warehouseId],queryFn:()=>api.get<Envelope>("/api/number-series/available",{params:{module,reference,branchId,warehouseId}})});const options=useMemo(()=>{const term=search.toLocaleLowerCase();return(query.data?.data??[]).filter(x=>!term||`${x.code} ${x.name} ${x.format}`.toLocaleLowerCase().includes(term)).map(x=>({value:String(x.id),label:`${x.code} · ${x.name} · ${x.format}${x.isDefault?" ★":""}`}))},[query.data,search]);
 return <VoiceSearchCombobox aria-invalid={invalid} options={options} value={value||null} onSelect={next=>onChange(next?Number(next):"")} onDebouncedSearchChange={setSearch} onFetchNextPage={()=>{}} hasNextPage={false} isLoading={query.isLoading} isFetchingNextPage={false} minChars={0} placeholder={placeholder} searchPlaceholder={placeholder} modal/>;
}
