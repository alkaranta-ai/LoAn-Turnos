# LoAn Estética — App de Turnos

App web (PWA) para reservar turnos online. Funciona en Android, iOS y desktop desde un solo link, y se puede "instalar" en el teléfono sin pasar por las tiendas de apps.

## Archivos

- `index.html` — Sitio principal: servicios, calendario y reserva de turnos.
- `admin.html` — Panel de administración (turnos, servicios, horarios, config).
- `app.js` — Lógica del sitio principal.
- `admin.js` — Lógica del panel admin.
- `manifest.json` + `sw.js` + `icons/` — Configuración PWA (instalable).

## Publicar en GitHub Pages

1. Subí estos archivos a la raíz de tu repositorio (o a una carpeta, ej. `/docs`).
2. En GitHub: **Settings → Pages**.
3. En "Source" elegí la rama (ej. `main`) y la carpeta (`/` o `/docs`).
4. Guardá. GitHub te da una URL tipo:
   `https://TU-USUARIO.github.io/TU-REPO/`
5. Esperá 1-2 minutos y abrí el link.

## Configuración inicial (importante)

Antes de compartir el link, entrá a `admin.html` (contraseña por defecto: `loan2026`) y:

1. **Pestaña "Config"** → poné tu número de WhatsApp real (con código de país, sin "+" ni espacios). Ejemplo Campana/Buenos Aires: `5493489XXXXXX`.
2. Cambiá la contraseña del admin.
3. **Pestaña "Servicios"** → editá/agregá los tratamientos reales, duración y precios.
4. **Pestaña "Horarios"** → definí días y horario de atención, e intervalo entre turnos.

## Cómo lo usan tus clientas

1. Les compartís el link de GitHub Pages (por WhatsApp, Instagram, etc).
2. Abren el link → ven el sitio.
3. En el navegador (Chrome/Safari) tocan **"Agregar a pantalla de inicio"** → queda como ícono de app.
4. Eligen servicio → fecha en el calendario → horario disponible → completan nombre y WhatsApp → confirman.
5. Se abre WhatsApp con un mensaje prearmado para confirmar el turno con vos.

## Cómo administrás vos

- Entrás a `tudominio.github.io/TU-REPO/admin.html`
- Ahí ves todos los turnos, podés confirmarlos, cancelarlos, escribirle al cliente por WhatsApp, editar servicios, bloquear fechas (vacaciones/feriados) y cambiar el horario de atención.

## Importante sobre los datos

Los turnos, servicios y configuración se guardan en el **navegador de cada dispositivo** (localStorage). Esto significa:

- Si entrás al admin desde tu celu y desde tu PC, **cada uno tiene su propia base de datos local**.
- Usá siempre el mismo dispositivo/navegador para administrar, o exportá/importá respaldos desde "Config → Exportar respaldo" para pasar los datos entre dispositivos.
- Si una clienta borra el caché del navegador, no pierde nada importante (solo afecta su propia vista).

## Próximo paso recomendado

Si más adelante querés que **todos** los turnos se vean desde cualquier dispositivo en tiempo real (vos y tus clientas viendo la misma agenda), hay que conectar una base de datos en la nube (ej. Firebase o Supabase, ambos con planes gratuitos). Decime y te lo armo.
