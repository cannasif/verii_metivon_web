import { type ReactElement, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { userDetailFormSchema, type UserDetailFormSchema, Gender, GENDER_OPTIONS } from '../types/user-detail-types';
import { useUserDetailByUserId } from '../hooks/useUserDetailByUserId';
import { useCreateUserDetail } from '../hooks/useCreateUserDetail';
import { useUpdateUserDetail } from '../hooks/useUpdateUserDetail';
import { useUploadProfilePicture } from '../hooks/useUploadProfilePicture';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { toast } from 'sonner';
import { getImageUrl } from '../utils/image-url';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import { changePasswordSchema, type ChangePasswordRequest } from '@/features/auth/types/auth';
import {
  User,
  Camera,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Building2,
  Briefcase,
  Phone,
  Linkedin,
  Ruler,
  Weight,
  FileText,
  CheckCircle,
  ShieldCheck,
  CalendarClock,
  Settings,
  X,
} from 'lucide-react';
import { ProfilePictureEditor } from './ProfilePictureEditor';
import { formatSystemDateTime } from '@/lib/system-settings';

export function ProfilePage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const { user, branch } = useAuthStore();
  const userId = user?.id || 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: userDetail, isLoading: isLoadingDetail, refetch: refetchUserDetail } = useUserDetailByUserId(userId);

  const createUserDetail = useCreateUserDetail();
  const updateUserDetail = useUpdateUserDetail();
  const uploadProfilePicture = useUploadProfilePicture();
  const changePassword = useChangePassword();

  const changePasswordForm = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const form = useForm<UserDetailFormSchema>({
    resolver: zodResolver(userDetailFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      profilePictureUrl: '',
      height: undefined,
      weight: undefined,
      description: '',
      gender: undefined,
      linkedinUrl: '',
      phoneNumber: '',
      email: '',
    },
  });

  useEffect(() => {
    setPageTitle(t('userDetailManagement.profilePageTitle'));
    return () => setPageTitle(null);
  }, [t, setPageTitle]);

  useEffect(() => {
    if (userDetail) {
      form.reset({
        profilePictureUrl: userDetail.profilePictureUrl || '',
        height: userDetail.height || undefined,
        weight: userDetail.weight || undefined,
        description: userDetail.description || '',
        gender: userDetail.gender || undefined,
        linkedinUrl: userDetail.linkedinUrl || '',
        phoneNumber: userDetail.phoneNumber || '',
        email: userDetail.email || '',
      });
      setPreviewUrl(userDetail.profilePictureUrl ? getImageUrl(userDetail.profilePictureUrl) : null);
    }
  }, [userDetail, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setIsEditorOpen(true);
    };
    reader.readAsDataURL(file);

    event.target.value = '';
  };

  const handleSaveCroppedImage = async (croppedBlob: Blob): Promise<void> => {
    try {
      const file = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' });
      await uploadProfilePicture.mutateAsync({ userId, file });
      await refetchUserDetail();
      setIsEditorOpen(false);
      setSelectedImage(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (data: UserDetailFormSchema): Promise<void> => {
    if (userDetail) {
      await updateUserDetail.mutateAsync({
        id: userDetail.id,
        data: {
          profilePictureUrl: data.profilePictureUrl || undefined,
          height: data.height || undefined,
          weight: data.weight || undefined,
          description: data.description || undefined,
          gender: data.gender || undefined,
          linkedinUrl: data.linkedinUrl || undefined,
          phoneNumber: data.phoneNumber || undefined,
          email: data.email || undefined,
        },
      });
    } else {
      await createUserDetail.mutateAsync({
        userId,
        profilePictureUrl: data.profilePictureUrl || undefined,
        height: data.height || undefined,
        weight: data.weight || undefined,
        description: data.description || undefined,
        gender: data.gender || undefined,
        linkedinUrl: data.linkedinUrl || undefined,
        phoneNumber: data.phoneNumber || undefined,
        email: data.email || undefined,
      });
    }
    toast.success(t('userDetailManagement.saveSuccess'));
  };

  const handleChangePasswordSubmit = async (data: ChangePasswordRequest): Promise<void> => {
    await changePassword.mutateAsync(data);
    changePasswordForm.reset();
  };

  const isSaving = createUserDetail.isPending || updateUserDetail.isPending;
  const isChangingPassword = changePassword.isPending;
  const displayName = user?.name || user?.email || t('userDetailManagement.defaultUser');

  if (isLoadingDetail) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 px-4 sm:px-8">
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all bg-white/80 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 shadow-sm w-fit"
        >
          <ArrowLeft size={16} />
          {t('userDetailManagement.backToHome')}
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-slate-300 dark:border-white/10 bg-linear-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 backdrop-blur-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-20 -mt-20 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 blur-3xl -ml-20 -mb-20 rounded-full" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative shrink-0 group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-slate-300/50 dark:border-white/20 bg-muted overflow-hidden shadow-2xl ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-500">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white bg-linear-to-br from-primary via-primary to-orange-500">
                  {displayName[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm cursor-pointer"
              >
                <Camera size={32} className="text-white transform scale-90 group-hover:scale-100 transition-transform" />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 dark:text-white">
                    {displayName}
                  </h1>
                  <Badge variant="outline" className="w-fit mx-auto md:mx-0 border-primary/30 bg-primary/5 text-primary font-bold px-3 py-1 rounded-lg">
                    {user?.role || t('userDetailManagement.userRole')}
                  </Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2">
                  <span className="flex items-center gap-1.5"><Mail size={16} className="opacity-60" /> {user?.email}</span>
                  <span className="hidden sm:inline opacity-20">|</span>
                  <span className="flex items-center gap-1.5"><Building2 size={16} className="opacity-60" /> {branch?.name || '-'}</span>
                  <span className="hidden sm:inline opacity-20">|</span>
                  <span className="flex items-center gap-1.5"><Briefcase size={16} className="opacity-60" /> {user?.role || '-'}</span>
                </p>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="rounded-2xl border-slate-300 dark:border-white/20 bg-white/40 dark:bg-white/5 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-white/10 transition-all gap-2 font-bold shadow-sm px-6">
                    <Settings size={18} className="text-primary" />
                    {t('userDetailManagement.profileEditTitle')}
                  </Button>
                </SheetTrigger>
                <SheetContent showCloseButton={false} className="w-full sm:max-w-2xl overflow-y-auto border-l border-white/20 bg-white/90 dark:bg-[#180F22] backdrop-blur-3xl p-0">
                  <div className="p-8 space-y-8 relative">
                    <div className="absolute right-8 top-8 z-50">
                      <SheetClose asChild>
                        <Button variant="outline" size="icon" className="rounded-2xl border-2 border-slate-300 dark:border-white/30 bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 transition-all text-muted-foreground hover:text-primary shadow-md">
                          <X size={24} />
                        </Button>
                      </SheetClose>
                    </div>
                    <SheetHeader>
                      <SheetTitle className="text-3xl font-black tracking-tighter">{t('userDetailManagement.profileEditTitle')}</SheetTitle>
                      <SheetDescription className="text-base font-medium">{t('userDetailManagement.profileEditDescription')}</SheetDescription>
                    </SheetHeader>

                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="w-full grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#211629] rounded-2xl h-14 mb-8">
                        <TabsTrigger value="personal" className="rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                          <User size={16} />
                          {t('userDetailManagement.personalInfo')}
                        </TabsTrigger>
                        <TabsTrigger value="security" className="rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                          <Lock size={16} />
                          {t('userDetailManagement.security')}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="personal" className="mt-0 space-y-6">
                        <div className="bg-white/60 dark:bg-[#211629] backdrop-blur-xl rounded-3xl p-10 border border-slate-200 dark:border-white/10 shadow-sm">
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField
                                  control={form.control}
                                  name="height"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                        {t('userDetailManagement.height')}
                                      </FormLabel>
                                      <FormControl>
                                        <div className="relative group">
                                          <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors size-5" />
                                          <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                            className="pl-12 h-14 text-base rounded-xl bg-white/50 dark:bg-[#14091C] border-slate-200 dark:border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary transition-all"
                                            placeholder={t('userDetailManagement.heightPlaceholderExample')}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="weight"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                        {t('userDetailManagement.weight')}
                                      </FormLabel>
                                      <FormControl>
                                        <div className="relative group">
                                          <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors size-5" />
                                          <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                            className="pl-12 h-14 text-base rounded-xl bg-white/50 dark:bg-[#14091C] border-slate-200 dark:border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary transition-all"
                                            placeholder={t('userDetailManagement.weightPlaceholderExample')}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                      {t('userDetailManagement.gender')}
                                    </FormLabel>
                                    <div className="relative group w-full">
                                      <User className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground group-focus-within:text-primary transition-colors size-5" />
                                      <Select
                                        onValueChange={(value) => field.onChange(value && value !== 'none' ? (parseInt(value, 10) as Gender) : undefined)}
                                        value={field.value !== undefined ? String(field.value) : undefined}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="w-full pl-12 h-14 min-h-[56px] py-0 text-base rounded-xl bg-white/50 dark:bg-[#14091C] border-slate-200 dark:border-white/10 focus:ring-0 focus:ring-offset-0 focus:border-primary transition-all flex items-center">
                                            <SelectValue placeholder={t('userDetailManagement.selectGender')} />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="none">{t('userDetailManagement.noGenderSelected')}</SelectItem>
                                          {GENDER_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={String(opt.value)}>{t(`userDetailManagement.gender${opt.label}`)}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField
                                  control={form.control}
                                  name="phoneNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                        {t('userDetailManagement.phoneNumber')}
                                      </FormLabel>
                                      <FormControl>
                                        <div className="relative group">
                                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors size-5" />
                                          <Input
                                            type="text"
                                            {...field}
                                            value={field.value ?? ''}
                                            className="pl-12 h-14 text-base rounded-xl bg-white/50 dark:bg-[#14091C] border-slate-200 dark:border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary transition-all"
                                            placeholder={t('userDetailManagement.enterPhoneNumber')}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                        {t('userDetailManagement.email')}
                                      </FormLabel>
                                      <FormControl>
                                        <div className="relative group">
                                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors size-5" />
                                          <Input
                                            type="email"
                                            {...field}
                                            value={field.value ?? ''}
                                            className="pl-12 h-14 text-base rounded-xl bg-white/50 dark:bg-[#14091C] border-slate-200 dark:border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary transition-all"
                                            placeholder={t('userDetailManagement.enterEmail')}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name="linkedinUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                      {t('userDetailManagement.linkedinUrl')}
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative group">
                                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors size-5" />
                                        <Input
                                          type="url"
                                          {...field}
                                          value={field.value ?? ''}
                                          className="pl-12 h-14 text-base rounded-xl bg-white/50 dark:bg-[#14091C] border-slate-200 dark:border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary transition-all"
                                          placeholder={t('userDetailManagement.enterLinkedinUrl')}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                      {t('userDetailManagement.description')}
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative group">
                                        <FileText className="absolute left-4 top-5 text-muted-foreground group-focus-within:text-primary transition-colors size-5" />
                                        <Textarea
                                          {...field}
                                          value={field.value ?? ''}
                                          rows={4}
                                          className="pl-14 pt-5 text-base rounded-xl bg-white/50 dark:bg-[#14091C] border-slate-200 dark:border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary resize-none transition-all"
                                          placeholder={t('userDetailManagement.enterDescription')}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button type="submit" disabled={isSaving} className="w-full px-10 rounded-2xl font-black bg-[image:var(--crm-brand-gradient)] hover:opacity-90 transition-all h-14 shadow-lg shadow-primary/20 border-none text-white text-xl opacity-90 grayscale-[0] dark:opacity-100 dark:grayscale-0">
                                {isSaving ? <Loader2 className="animate-spin" /> : t('userDetailManagement.save')}
                              </Button>
                            </form>
                          </Form>
                        </div>
                      </TabsContent>

                      <TabsContent value="security" className="mt-0">
                        <div className="bg-white/60 dark:bg-[#211629] backdrop-blur-xl rounded-3xl p-10 border border-slate-200 dark:border-white/10 shadow-sm">
                          <Form {...changePasswordForm}>
                            <form onSubmit={changePasswordForm.handleSubmit(handleChangePasswordSubmit)} className="space-y-6">
                              <FormField
                                control={changePasswordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                      {t('userDetailManagement.currentPassword')}
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-orange-500 transition-colors size-5" />
                                        <Input
                                          type={isCurrentPasswordVisible ? 'text' : 'password'}
                                          {...field}
                                          className="pl-12 pr-12 h-14 text-base rounded-xl bg-white/50 dark:bg-[#14091C] border-slate-200 dark:border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-orange-500 transition-all"
                                          placeholder="••••••••"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
                                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-orange-500 transition-colors"
                                        >
                                          {isCurrentPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={changePasswordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                      {t('userDetailManagement.newPassword')}
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-orange-500 transition-colors size-5" />
                                        <Input
                                          type={isNewPasswordVisible ? 'text' : 'password'}
                                          {...field}
                                          className="pl-12 pr-12 h-14 text-base rounded-xl bg-white/50 dark:bg-[#14091C] border-slate-200 dark:border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-orange-500 transition-all"
                                          placeholder={t('userDetailManagement.newPasswordPlaceholder')}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-orange-500 transition-colors"
                                        >
                                          {isNewPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button type="submit" disabled={isChangingPassword} className="w-full rounded-2xl font-black bg-[image:var(--crm-brand-gradient)] hover:opacity-90 transition-all h-14 shadow-lg shadow-primary/20 border-none text-white text-xl opacity-90 grayscale-[0] dark:opacity-100 dark:grayscale-0">
                                {isChangingPassword ? <Loader2 className="animate-spin" /> : t('userDetailManagement.changePasswordButton')}
                              </Button>
                            </form>
                          </Form>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              {userDetail?.phoneNumber && (
                <div className="px-4 py-2 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 flex items-center gap-2 shadow-sm">
                  <Phone size={16} className="text-orange-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{userDetail.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="metivon-panel rounded-3xl border lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="text-primary"/>{t('userDetailManagement.erpWorkspace')}</CardTitle><CardDescription>{t('userDetailManagement.erpWorkspaceDescription')}</CardDescription></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <ProfileInfo label={t('userDetailManagement.username')} value={user?.username || '-'} icon={User}/>
            <ProfileInfo label={t('userDetailManagement.branch')} value={branch?.name || '-'} icon={Building2}/>
            <ProfileInfo label={t('userDetailManagement.role')} value={user?.role || '-'} icon={Briefcase}/>
            <ProfileInfo label={t('userDetailManagement.email')} value={user?.email || '-'} icon={Mail}/>
          </CardContent>
        </Card>
        <Card className="metivon-panel rounded-3xl border">
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="text-emerald-500"/>{t('userDetailManagement.accountSecurity')}</CardTitle><CardDescription>{t('userDetailManagement.accountSecurityDescription')}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <StatusRow label={t('userDetailManagement.accountActive')} active={user!==null}/>
            <StatusRow label={t('userDetailManagement.profileRecord')} active={Boolean(userDetail)}/>
          </CardContent>
        </Card>
        <Card className="metivon-panel rounded-3xl border lg:col-span-3">
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="text-primary"/>{t('userDetailManagement.accountTimeline')}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <ProfileInfo label={t('userDetailManagement.createdAt')} value={userDetail?.createdDate?formatSystemDateTime(userDetail.createdDate):'-'} icon={FileText}/>
            <ProfileInfo label={t('userDetailManagement.profileRecord')} value={userDetail?`#${userDetail.id}`:t('userDetailManagement.notCreated')} icon={CheckCircle}/>
          </CardContent>
        </Card>
      </div>

      <ProfilePictureEditor
        image={selectedImage}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedImage(null);
        }}
        onSave={handleSaveCroppedImage}
        isSaving={uploadProfilePicture.isPending}
      />
    </div>
  );
}

function ProfileInfo({label,value,icon:Icon}:{label:string;value:string;icon:React.ElementType}){
  return <div className="rounded-2xl border bg-background/60 p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={18}/></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="truncate font-semibold">{value}</p></div></div></div>;
}
function StatusRow({label,active}:{label:string;active:boolean}){
  return <div className="flex items-center justify-between rounded-xl border p-3"><span className="text-sm font-medium">{label}</span><Badge className={active?'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15':'bg-amber-500/15 text-amber-700 hover:bg-amber-500/15'}>{active?'✓':'!'}</Badge></div>;
}
