import React, { type ReactNode } from 'react';
import Button from './Button';

interface FormEditProps {
  title?: ReactNode;
  actions?: ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: ReactNode;
  cancelLabel?: ReactNode;
  isSaving?: boolean;
  disableSave?: boolean;
  children: ReactNode;
}

const FormEdit: React.FC<FormEditProps> = ({
  title,
  actions,
  onSave,
  onCancel,
  saveLabel = 'SALVAR',
  cancelLabel = 'CANCELAR',
  isSaving,
  disableSave,
  children
}) => {
  const shouldRenderHeader = Boolean(title) || Boolean(actions) || Boolean(onCancel) || Boolean(onSave);

  return (
    <div className="h-full flex flex-col">
      {shouldRenderHeader && (
        <div className="p-6 border-b border-border-strong/30 flex items-center justify-between gap-4 bg-white/5 shrink-0">
          <div className="min-w-0 flex-1">
            {typeof title === 'string' ? (
              <h3 className="text-xs font-black tracking-widest uppercase text-foreground truncate">
                {title}
              </h3>
            ) : (
              title
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {actions ? (
              actions
            ) : (
              <>
                {onCancel && (
                  <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                    {cancelLabel}
                  </Button>
                )}
                {onSave && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={onSave}
                    loading={isSaving}
                    disabled={disableSave || isSaving}
                  >
                    {saveLabel}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
};

export default FormEdit;

