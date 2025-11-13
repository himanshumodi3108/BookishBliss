import { SnackbarProvider } from 'notistack';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={3000}
      dense
      preventDuplicate
    >
      {children}
    </SnackbarProvider>
  );
}

