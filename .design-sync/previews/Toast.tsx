import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose } from 'wartgeld-generator-zug';

export const Success = () => (
  <ToastProvider>
    <Toast open duration={1e9}>
      <div className="grid gap-1">
        <ToastTitle>Einstellungen gespeichert</ToastTitle>
        <ToastDescription>Ihre Absenderangaben werden für alle Rechnungen verwendet.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
    <ToastViewport className="static w-[420px] max-w-full p-0" />
  </ToastProvider>
);

export const Destructive = () => (
  <ToastProvider>
    <Toast variant="destructive" open duration={1e9}>
      <div className="grid gap-1">
        <ToastTitle>PDF konnte nicht erstellt werden</ToastTitle>
        <ToastDescription>Bitte versuchen Sie es erneut.</ToastDescription>
      </div>
      <ToastAction altText="Erneut versuchen">Erneut versuchen</ToastAction>
    </Toast>
    <ToastViewport className="static w-[420px] max-w-full p-0" />
  </ToastProvider>
);
