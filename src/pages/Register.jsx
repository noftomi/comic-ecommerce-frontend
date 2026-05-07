import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

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
      const userData = await register(payload);
      setUser(userData);
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.error || err.message || "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field) =>
    `bg-white border-2 ${
      errors[field] ? "border-[#C50000]" : "border-zinc-900"
    } p-4 w-full focus:outline-none focus:bg-[#FFFBF0] font-bold font-body placeholder:text-zinc-400 transition-colors`;

  return (
    <main
      className="min-h-screen flex items-center justify-center py-20 px-6"
      style={{
        background: "radial-gradient(#1e1c0e 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundColor: "#FFF9EA",
      }}
    >
      <div
        className="w-full max-w-2xl bg-[#FFF9EA] border-4 border-zinc-900 relative overflow-hidden"
        style={{ boxShadow: "8px 8px 0px 0px #1e1c0e" }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#C50000]" />

        <div className="p-8 md:p-12">
          <header className="mb-10">
            <h1
              className="font-black text-5xl md:text-6xl uppercase tracking-tighter text-zinc-900 leading-none mb-4 italic"
              style={{ fontFamily: "Epilogue, sans-serif" }}
            >
              Únete a la{" "}
              <span className="text-[#C50000]">Revolución</span>
            </h1>
            <p
              className="text-lg font-bold text-[#5d3f3a] uppercase tracking-wide"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Crea tu cuenta para empezar a coleccionar.
            </p>
          </header>

          {serverError && (
            <div className="mb-6 border-2 border-[#C50000] bg-[#ffdad4] px-4 py-3 flex items-center gap-3">
              <span
                className="material-symbols-outlined text-[#C50000]"
                style={{ fontSize: "20px" }}
              >
                error
              </span>
              <p className="font-bold text-[#C50000] text-sm uppercase tracking-wide">
                {serverError}
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  className="font-bold uppercase tracking-widest text-xs"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
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
                  <p className="text-[#C50000] text-xs font-bold uppercase tracking-wide">
                    {errors.nombre}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="font-bold uppercase tracking-widest text-xs"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
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
                  <p className="text-[#C50000] text-xs font-bold uppercase tracking-wide">
                    {errors.apellido}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="font-bold uppercase tracking-widest text-xs"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
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
                <p className="text-[#C50000] text-xs font-bold uppercase tracking-wide">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  className="font-bold uppercase tracking-widest text-xs"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
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
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
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
                  <p className="text-[#C50000] text-xs font-bold uppercase tracking-wide">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="font-bold uppercase tracking-widest text-xs"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
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
                    onClick={() => setShowConfirm((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
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
                  <p className="text-[#C50000] text-xs font-bold uppercase tracking-wide">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Sección vendedor */}
            <div
              className={`border-2 border-zinc-900 transition-colors duration-200 ${
                form.esSeller ? "bg-[#FFFBF0]" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3 p-4">
                <input
                  className="w-6 h-6 border-2 border-zinc-900 focus:ring-0 rounded-none bg-white appearance-none checked:bg-[#C50000] cursor-pointer shrink-0"
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
                  className="font-bold uppercase tracking-wide text-sm cursor-pointer select-none"
                  htmlFor="esSeller"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Quiero registrarme como{" "}
                  <span className="text-[#C50000]">vendedor</span>
                </label>
              </div>

              {form.esSeller && (
                <div className="border-t-2 border-zinc-900 px-4 pb-6 pt-6 space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#C50000]" />
                    <p
                      className="font-black uppercase tracking-widest text-xs text-[#C50000]"
                      style={{ fontFamily: "Epilogue, sans-serif" }}
                    >
                      Datos de tu tienda
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label
                        className="font-bold uppercase tracking-widest text-xs"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
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
                        <p className="text-[#C50000] text-xs font-bold uppercase tracking-wide">
                          {errors.cuil}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        className="font-bold uppercase tracking-widest text-xs"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        Teléfono de contacto{" "}
                        <span className="normal-case font-normal text-zinc-500 tracking-normal">
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

                  {/* País + Teléfono */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex flex-col gap-2">
                      <label
                        className="font-bold uppercase tracking-widest text-xs"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
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
                        <p className="text-[#C50000] text-xs font-bold uppercase tracking-wide">
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
                            <p className="text-[#C50000] text-xs font-bold uppercase tracking-wide">
                              {errors.paisCustom}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Términos vendedor */}
                  <div className="flex items-start gap-3 border-2 border-zinc-900 bg-white p-4">
                    <input
                      className="w-5 h-5 border-2 border-zinc-900 focus:ring-0 rounded-none bg-white appearance-none checked:bg-[#C50000] cursor-pointer shrink-0 mt-0.5"
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
                      className="text-xs font-bold text-zinc-700 leading-relaxed cursor-pointer"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      Acepto los{" "}
                      <span className="text-[#C50000] underline">
                        términos y condiciones para vendedores
                      </span>
                      , incluyendo la comisión del 8% por venta y la política de envíos de Comics Corp.
                    </label>
                  </div>
                  {errors.aceptaTerminos && (
                    <p className="text-[#C50000] text-xs font-bold uppercase tracking-wide">
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
                className="w-full bg-[#C50000] text-white border-4 border-zinc-900 py-5 font-black text-2xl uppercase tracking-tighter flex items-center justify-center gap-3 group transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "Epilogue, sans-serif",
                  boxShadow: loading ? "none" : "4px 4px 0px 0px #1e1c0e",
                }}
                onMouseDown={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translate(4px, 4px)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = loading ? "none" : "4px 4px 0px 0px #1e1c0e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = loading ? "none" : "4px 4px 0px 0px #1e1c0e";
                }}
              >
                {loading ? (
                  <>
                    <span>Creando cuenta...</span>
                    <span
                      className="material-symbols-outlined animate-spin"
                      style={{ fontSize: "24px" }}
                    >
                      progress_activity
                    </span>
                  </>
                ) : (
                  <>
                    <span>Crear cuenta</span>
                    <span
                      className="material-symbols-outlined group-hover:translate-x-2 transition-transform"
                      style={{ fontSize: "24px" }}
                    >
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          <footer className="mt-12 pt-8 border-t-2 border-[#e9e2cc] flex flex-row items-center justify-center gap-2">
            <p
              className="text-sm font-bold text-[#5d3f3a] uppercase tracking-widest"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              ¿Ya eres miembro?
            </p>
            <Link
              to="/login"
              className="font-black text-[#C50000] uppercase underline decoration-2 underline-offset-4 hover:text-zinc-900 transition-colors"
              style={{ fontFamily: "Epilogue, sans-serif" }}
            >
              Inicia Sesión
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
