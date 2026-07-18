import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Boxes, ClipboardCheck, FileText, PackageOpen, ShoppingCart, Truck, Users, Warehouse } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const copy:Record<string,[string,string,string,string,string,string]>= {
 tr:["Operasyon merkezi","Günün ERP akışı tek ekranda","Cari, stok, depo, mal kabul ve sevk süreçlerinde doğrudan işe başlayın.","Ana çalışma alanları","Hızlı işlemler","Aktif şube"],
 en:["Operations center","Your daily ERP flow in one place","Start working directly across accounts, inventory, warehouse, receiving and shipping.","Core workspaces","Quick actions","Active branch"],
 de:["Betriebszentrale","Ihr täglicher ERP-Ablauf auf einen Blick","Starten Sie direkt mit Konten, Bestand, Lager, Wareneingang und Versand.","Kernbereiche","Schnellaktionen","Aktive Niederlassung"],
 fr:["Centre des opérations","Votre flux ERP quotidien en un seul écran","Travaillez directement sur les comptes, stocks, entrepôts, réceptions et expéditions.","Espaces principaux","Actions rapides","Agence active"],
 es:["Centro de operaciones","El flujo ERP diario en una sola pantalla","Trabaje directamente con cuentas, inventario, almacén, recepción y envíos.","Áreas principales","Acciones rápidas","Sucursal activa"],
 it:["Centro operativo","Il flusso ERP quotidiano in un'unica schermata","Lavora direttamente su conti, inventario, magazzino, ricevimento e spedizioni.","Aree principali","Azioni rapide","Filiale attiva"],
 pt:["Centro de operações","Seu fluxo ERP diário em uma tela","Trabalhe diretamente com contas, estoque, armazém, recebimento e expedição.","Áreas principais","Ações rápidas","Filial ativa"],
 nl:["Operationeel centrum","Uw dagelijkse ERP-stroom op één scherm","Werk direct met relaties, voorraad, magazijn, ontvangst en verzending.","Kernwerkruimten","Snelle acties","Actieve vestiging"],
 pl:["Centrum operacyjne","Codzienny przepływ ERP na jednym ekranie","Pracuj bezpośrednio z kontrahentami, zapasami, magazynem, przyjęciem i wysyłką.","Główne obszary","Szybkie akcje","Aktywny oddział"],
 ru:["Операционный центр","Ежедневные процессы ERP на одном экране","Работайте со счетами, запасами, складами, приемкой и отгрузкой.","Основные области","Быстрые действия","Активный филиал"],
 ar:["مركز العمليات","تدفق ERP اليومي في شاشة واحدة","ابدأ العمل مباشرة على الحسابات والمخزون والمستودعات والاستلام والشحن.","مساحات العمل الرئيسية","إجراءات سريعة","الفرع النشط"],
 fa:["مرکز عملیات","جریان روزانه ERP در یک صفحه","کار با حساب‌ها، موجودی، انبار، دریافت و ارسال را مستقیماً آغاز کنید.","فضاهای اصلی","عملیات سریع","شعبه فعال"],
 ja:["オペレーションセンター","日々のERP業務を一画面に","取引先、在庫、倉庫、入荷、出荷の作業をすぐに開始できます。","主要ワークスペース","クイック操作","有効な支店"],
 ko:["운영 센터","일일 ERP 흐름을 한 화면에서","거래처, 재고, 창고, 입고와 출고 업무를 바로 시작하세요.","핵심 작업공간","빠른 작업","활성 지점"],
 zh:["运营中心","在一个页面掌握每日 ERP 流程","直接开始往来单位、库存、仓库、收货和发运工作。","核心工作区","快捷操作","当前分支"]};

export function MetivonDashboardPage():ReactElement{
 const{t,i18n}=useTranslation("erp");const language=(i18n.resolvedLanguage||i18n.language||"en").split("-")[0];const c=copy[language]??copy.en;const branch=useAuthStore(s=>s.branch);
 const modules=[
  {title:t("nav.accountManagement"),description:t("nav.accountOperations"),href:"/accounts",icon:Users,tone:"from-sky-500 to-blue-600"},
  {title:t("nav.stockManagement"),description:t("nav.balances"),href:"/inventory",icon:Boxes,tone:"from-emerald-500 to-teal-600"},
  {title:t("nav.warehouses"),description:t("nav.locations"),href:"/warehouses",icon:Warehouse,tone:"from-amber-500 to-orange-600"},
  {title:t("nav.receipts"),description:t("nav.transfers"),href:"/goods-receipts",icon:PackageOpen,tone:"from-violet-500 to-fuchsia-600"}];
 const actions=[{label:t("nav.purchaseOrders"),href:"/purchase-orders",icon:ShoppingCart},{label:t("nav.receipts"),href:"/goods-receipts",icon:ClipboardCheck},{label:t("nav.shipments"),href:"/shipments",icon:Truck},{label:t("nav.eDocuments"),href:"/e-documents",icon:FileText}];
 return <div className="mx-auto w-full max-w-7xl space-y-6 pb-8"><section className="metivon-hero relative overflow-hidden rounded-3xl p-7 md:p-10"><div className="relative max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.28em] text-white/65">{c[0]}</p><h1 className="mt-3 text-3xl font-semibold md:text-5xl">{c[1]}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 md:text-base">{c[2]}</p><div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm"><span className="h-2 w-2 rounded-full bg-emerald-400"/><span className="text-white/60">{c[5]}:</span><strong>{branch?.name||"—"}</strong></div></div></section>
 <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold uppercase tracking-[.18em] text-muted-foreground">{c[3]}</h2></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{modules.map(({title,description,href,icon:Icon,tone})=><Link key={href} to={href} className="group rounded-3xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg`}><Icon className="h-6 w-6"/></div><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">{t("common.actions")}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180"/></span></Link>)}</div></section>
 <section className="rounded-3xl border bg-card p-5 md:p-6"><h2 className="text-sm font-semibold uppercase tracking-[.18em] text-muted-foreground">{c[4]}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{actions.map(({label,href,icon:Icon})=><Link key={href} to={href} className="flex items-center justify-between rounded-2xl border bg-muted/30 p-4 transition hover:border-primary/30 hover:bg-primary/5"><span className="flex items-center gap-3"><span className="rounded-xl bg-background p-2 shadow-sm"><Icon className="h-4 w-4 text-primary"/></span><span className="text-sm font-medium">{label}</span></span><ArrowRight className="h-4 w-4 text-muted-foreground rtl:rotate-180"/></Link>)}</div></section></div>;
}
