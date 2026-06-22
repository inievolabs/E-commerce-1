-- Velin Studio: restrict privileged function execution

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

REVOKE ALL ON FUNCTION public.generate_order_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_order_id() TO authenticated, service_role;
