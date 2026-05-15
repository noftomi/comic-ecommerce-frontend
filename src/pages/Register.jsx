import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/motionVariants";
import { register } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    esSeller: false,
    cuil: "",
    pais: "",
    paisCustom: "",
    telefono: "",
    aceptaTerminos: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  }

  function validate() {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!form.apellido.trim()) newErrors.apellido = "El apellido es requerido";
    if (!form.email.trim()) newErrors.email = "El correo es requerido";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "El correo no es válido";
    if (!form.password) newErrors.password = "La contraseña es requerida";
    else if (form.password.length < 6) newErrors.password = "Mínimo 6 caracteres";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    if (form.esSeller) {
      if (!form.cuil.trim()) newErrors.cuil = "El CUIL es requerido";
      else if (!/^\d{11}$/.test(form.cuil.replace(/\D/g, ""))) {
        newErrors.cuil = "Ingresá un CUIL válido de 11 dígitos";
      }
      if (!form.pais) newErrors.pais = "Seleccioná tu país";
      if (form.pais === "OTHER" && !form.paisCustom.trim()) newErrors.paisCustom = "Escribí el nombre de tu país";
      if (!form.aceptaTerminos) newErrors.aceptaTerminos = "Debés aceptar los términos para vender";
    }
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: `${form.nombre.trim()} ${form.apellido.trim()}`,
        email: form.email,
        password: form.password,
        esSeller: form.esSeller,
        ...(form.esSeller && {
          cuil: form.cuil.replace(/\D/g, ""),
          pais: form.pais === "OTHER" ? form.paisCustom.trim() : form.pais,
          ...(form.telefono.trim() && { telefono: form.telefono.trim() }),
        }),
      };
      await register(payload);
      navigate("/verify-email-sent", { state: { email: form.email } });
    } catch (err) {
      setServerError(err.response?.data?.error || err.message || "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field) =>
    `bg-surface-container-lowest border-2 ${
      errors[field] ? "border-primary-container" : "border-on-surface"
    } p-4 w-full focus:outline-none focus:bg-surface-bright font-bold font-body placeholder:text-on-surface-variant/50 transition-colors`;

  return (
    <main
      className="min-h-screen flex items-center justify-center py-20 px-6"
      style={{
        background: "radial-gradient(#1e1c0e 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundColor: "#FFF9E8",
      }}
    >
      <motion.div
        {...fadeUp}
        className="w-full max-w-2xl bg-surface border-4 border-on-surface relative overflow-hidden"
        style={{ boxShadow: "8px 8px 0px 0px #1e1c0e" }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary-container" />

        <div className="p-8 md:p-12">
          <header className="mb-10">
            <h1 className="font-headline font-black text-5xl md:text-6xl uppercase tracking-tighter text-on-surface leading-none mb-4 italic">
              Únete a la{" "}
              <span className="text-primary-container">Revolución</span>
            </h1>
            <p className="font-body text-lg font-bold text-on-surface-variant uppercase tracking-wide">
              Crea tu cuenta para empezar a coleccionar.
            </p>
          </header>

          {serverError && (
            <div className="mb-6 border-2 border-primary-container bg-[#ffdad4] px-4 py-3 flex items-center gap-3">
              <p className="font-body font-bold text-primary-container text-sm uppercase tracking-wide">
                {serverError}
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-body font-bold uppercase tracking-widest text-xs">
                  Nombre
                </label>
                <input
                  className={inputClass("nombre")}
                  name="nombre"
                  type="text"
                  placeholder="ej. Pedro"
                  value={form.nombre}
                  onChange={handleChange}
                  autoComplete="given-name"
                />
                {errors.nombre && (
                  <p className="font-body text-primary-container text-xs font-bold uppercase tracking-wide">
                    {errors.nombre}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-body font-bold uppercase tracking-widest text-xs">
                  Apellido
                </label>
                <input
                  className={inputClass("apellido")}
                  name="apellido"
                  type="text"
                  placeholder="ej. Parker"
                  value={form.apellido}
                  onChange={handleChange}
                  autoComplete="family-name"
                />
                {errors.apellido && (
                  <p className="font-body text-primary-container text-xs font-bold uppercase tracking-wide">
                    {errors.apellido}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-body font-bold uppercase tracking-widest text-xs">
                Correo Electrónico
              </label>
              <input
                className={inputClass("email")}
                name="email"
                type="email"
                placeholder="heroe@comics-corp.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && (
                <p className="font-body text-primary-container text-xs font-bold uppercase tracking-wide">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-body font-bold uppercase tracking-widest text-xs">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    className={`${inputClass("password")} pr-12`}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((c) => !c)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="font-body text-primary-container text-xs font-bold uppercase tracking-wide">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-body font-bold uppercase tracking-widest text-xs">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    className={`${inputClass("confirmPassword")} pr-12`}
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((c) => !c)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label={showConfirm ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showConfirm ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="font-body text-primary-container text-xs font-bold uppercase tracking-wide">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Sección vendedor */}
            <div
              className={`border-2 border-on-surface transition-colors duration-200 ${
                form.esSeller ? "bg-surface-bright" : "bg-surface-container-lowest"
              }`}
            >
              <div className="flex items-center gap-3 p-4">
                <input
                  className="w-6 h-6 border-2 border-on-surface focus:ring-0 rounded-none bg-surface-container-lowest appearance-none checked:bg-primary-container cursor-pointer shrink-0"
                  style={{
                    backgroundImage: form.esSeller
                      ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E\")"
                      : "none",
                    backgroundSize: "100% 100%",
                  }}
                  id="esSeller"
                  name="esSeller"
                  type="checkbox"
                  checked={form.esSeller}
                  onChange={handleChange}
                />
                <label
                  className="font-body font-bold uppercase tracking-wide text-sm cursor-pointer select-none"
                  htmlFor="esSeller"
                >
                  Quiero registrarme como{" "}
                  <span className="text-primary-container">vendedor</span>
                </label>
              </div>

              {form.esSeller && (
                <div className="border-t-2 border-on-surface px-4 pb-6 pt-6 space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary-container" />
                    <p className="font-headline font-black uppercase tracking-widest text-xs text-primary-container">
                      Datos de tu tienda
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="font-body font-bold uppercase tracking-widest text-xs">
                        CUIL
                      </label>
                      <input
                        className={inputClass("cuil")}
                        name="cuil"
                        type="text"
                        placeholder="20-12345678-9"
                        value={form.cuil}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                      {errors.cuil && (
                        <p className="font-body text-primary-container text-xs font-bold uppercase tracking-wide">
                          {errors.cuil}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-body font-bold uppercase tracking-widest text-xs">
                        Teléfono de contacto{" "}
                        <span className="normal-case font-normal text-on-surface-variant tracking-normal">
                          (opcional)
                        </span>
                      </label>
                      <input
                        className={inputClass("telefono")}
                        name="telefono"
                        type="tel"
                        placeholder="+54 11 0000-0000"
                        value={form.telefono}
                        onChange={handleChange}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="font-body font-bold uppercase tracking-widest text-xs">
                        País / Región
                      </label>
                      <select
                        className={`${inputClass("pais")} cursor-pointer`}
                        name="pais"
                        value={form.pais}
                        onChange={handleChange}
                      >
                        <option value="">Seleccioná tu país</option>
                        <option value="Argentina">Argentina</option>
                        <option value="México">México</option>
                        <option value="Chile">Chile</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Uruguay">Uruguay</option>
                        <option value="Perú">Perú</option>
                        <option value="España">España</option>
                        <option value="Estados Unidos">Estados Unidos</option>
                        <option value="OTHER">Otro</option>
                      </select>
                      {errors.pais && (
                        <p className="font-body text-primary-container text-xs font-bold uppercase tracking-wide">
                          {errors.pais}
                        </p>
                      )}
                      {form.pais === "OTHER" && (
                        <>
                          <input
                            className={inputClass("paisCustom")}
                            name="paisCustom"
                            type="text"
                            placeholder="Escribí tu país"
                            value={form.paisCustom}
                            onChange={handleChange}
                            autoComplete="country-name"
                          />
                          {errors.paisCustom && (
                            <p className="font-body text-primary-container text-xs font-bold uppercase tracking-wide">
                              {errors.paisCustom}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border-2 border-on-surface bg-surface-container-lowest p-4">
                    <input
                      className="w-5 h-5 border-2 border-on-surface focus:ring-0 rounded-none bg-surface-container-lowest appearance-none checked:bg-primary-container cursor-pointer shrink-0 mt-0.5"
                      style={{
                        backgroundImage: form.aceptaTerminos
                          ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E\")"
                          : "none",
                        backgroundSize: "100% 100%",
                      }}
                      id="aceptaTerminos"
                      name="aceptaTerminos"
                      type="checkbox"
                      checked={form.aceptaTerminos}
                      onChange={handleChange}
                    />
                    <label
                      htmlFor="aceptaTerminos"
                      className="font-body text-xs font-bold text-on-surface-variant leading-relaxed cursor-pointer"
                    >
                      Acepto los{" "}
                      <span className="text-primary-container underline">
                        términos y condiciones para vendedores
                      </span>
                      , incluyendo la comisión del 8% por venta y la política de envíos de Comics Corp.
                    </label>
                  </div>
                  {errors.aceptaTerminos && (
                    <p className="font-body text-primary-container text-xs font-bold uppercase tracking-wide">
                      {errors.aceptaTerminos}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-container text-on-primary border-4 border-on-surface py-5 font-headline font-black text-2xl uppercase tracking-tighter flex items-center justify-center gap-3 comic-push-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Creando cuenta...</span>
                ) : (
                  <>
                    <span>Crear cuenta</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          <footer className="mt-12 pt-8 border-t-2 border-outline-variant flex flex-row items-center justify-center gap-2">
            <p className="font-body text-sm font-bold text-on-surface-variant uppercase tracking-widest">
              ¿Ya eres miembro?
            </p>
            <Link
              to="/login"
              className="font-headline font-black text-primary-container uppercase underline decoration-2 underline-offset-4 hover:text-on-surface transition-colors"
            >
              Inicia Sesión
            </Link>
          </footer>
        </div>
      </motion.div>
    </main>
  );
}
