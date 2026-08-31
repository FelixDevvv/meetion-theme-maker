# Tienda MeeTion MC — tema Tebex (morado/magenta)

Recreación de tienda.meetionmc.com como tienda Tebex funcional: catálogo real, cesta multi-paquete y checkout oficial de Tebex. Todo el texto en español, con paleta morado/magenta.

## Qué se construye

**Cabecera hero**
- Banner superior de promoción ("¡Consigue 30% de descuento!") con botón.
- Hero con imagen de fondo (arte de servidor), logo/nombre del servidor centrado.
- Izquierda: contador de jugadores + IP del servidor con "haz clic para copiar".
- Derecha: miembros de Discord + enlace "Servidor de Discord".
- Esquina superior derecha: "Invitado / Haz clic para iniciar sesión" (login de Tebex por nombre de usuario, se guarda localmente para asignar la compra).

**Columna lateral izquierda**
- Tarjeta "Selecciona una categoría" que despliega las categorías reales de la tienda.
- "Top donador" del mes.
- "Pagos recientes" (rejilla de avatares de jugadores).
- Saldo de tarjeta regalo / cupón.

**Contenido principal**
- Bienvenida "Tienda oficial de MeeTion Network" + meta mensual con barra de progreso.
- Paquetes destacados en tarjetas con imagen, nombre, precio y precio rebajado.
- Página de categoría con rejilla de paquetes.
- Página de paquete con descripción, precio y botón "Añadir a la cesta".

**Cesta y checkout**
- Panel lateral de cesta: añadir, cambiar cantidad, quitar, subtotal.
- Botón "Pagar" que crea la cesta en Tebex y redirige al checkout oficial de Tebex.
- Página de "compra completada" al volver del pago.

**Diseño**
- Paleta morado profundo / magenta con degradados y brillo neón, tarjetas oscuras translúcidas, bordes redondeados, tipografía condensada en mayúsculas para títulos (estilo Tebex).
- Tokens de color definidos en `src/styles.css`; responsive móvil/escritorio.

## Detalles técnicos

- **API**: Tebex Headless API (`https://headless.tebex.io/api`) con el identificador de webstore proporcionado. Es un token público de solo lectura/cesta, así que puede vivir en el código del cliente; aun así las llamadas se hacen desde funciones de servidor (`createServerFn`) para catálogo y creación de cesta, y se cachean con TanStack Query.
- Endpoints usados: `/accounts/{token}` (info de tienda), `/accounts/{token}/categories?includePackages=1`, `/accounts/{token}/packages/{id}`, `/accounts/{token}/baskets` (crear cesta con URLs de retorno), `/baskets/{ident}/packages` (añadir/quitar), y `links.checkout` para redirigir al pago.
- El identificador de la cesta se guarda en `localStorage` para persistir entre recargas.
- Rutas: `/` (inicio), `/categoria/$slug`, `/paquete/$id`, `/compra-completada`, `/compra-cancelada`. Cada ruta con su propio `head()` en español.
- Manejo de errores: si Tebex responde error, se muestra un mensaje claro en la UI en lugar de una página en blanco.
- Los datos que Tebex Headless no expone (top donador, meta mensual, pagos recientes) se rellenan con valores configurables en un archivo de constantes, claramente marcados para editar.

## Nota sobre la clave

La clave que compartiste en el chat es el identificador público de la tienda Headless (seguro para el frontend). Si más adelante quieres funciones privadas (webhooks, historial de pagos por jugador) hará falta la clave secreta de Tebex, y esa se guardará en el almacén de secretos, nunca en el código.
