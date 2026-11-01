-- Add audit logging functionality
CREATE OR REPLACE FUNCTION public.log_audit_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (action, user_id, details)
    VALUES (
        TG_OP || ' ' || TG_TABLE_NAME,
        auth.uid(),
        jsonb_build_object(
            'old_data', row_to_json(OLD),
            'new_data', row_to_json(NEW)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to applications and payments
CREATE TRIGGER tr_audit_applications
AFTER INSERT OR UPDATE OR DELETE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE TRIGGER tr_audit_payments
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();