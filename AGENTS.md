# AGENTS.md — D’ChocolAte Ecommerce

## 1. Propósito del proyecto

D’ChocolAte Ecommerce es una plataforma de comercio electrónico para la venta de bombones, chocolates y turrones artesanales.

El objetivo es construir un ecosistema completo que incluya:

- Tienda online.
- Panel de administración (backoffice).
- Gestión de catálogo, categorías y productos.
- Gestión de variantes, personalizaciones y packs.
- Gestión de disponibilidad y pedidos.
- Gestión de clientes y pagos.
- Inventario de materias primas y producción.
- Seguimiento de pedidos.
- Seguridad, auditoría y trazabilidad.

<<<<<<< Updated upstream
- Catalog products, categories, filtering and sorting live in `src/lib/catalog.ts` as static sample data; swap that module's data source when a backend is added so pages keep the same API.
- Catalog filters (search, category, sort) are URL search params on `/` so filtered views are shareable.
- Brand logo, wordmark and mascot are asset pointers in `src/assets`; render the header logo through `BrandLogo` so brand changes stay in one place.
- Pack slot operations and preview geometry live in `src/lib/packs.ts`; the pack builder's state (container, slots, ribbon, topper, extras, message) and its total live in `src/lib/builder.ts` as a pure reducer, so prices are testable and the same rules apply on every page.
- Pieces, boxes, ribbons and toppers are drawn as SVG in `src/components/packs` from catalog data (piece shape + filling look), so any new filling or container shows up in the live preview without new photos.
- Money rules live in `src/lib/pricing.ts` (catalog amounts are base-currency transfer prices; `priceFor` applies the payment method's discount and currency), so a future admin-configured currency list only changes that module.
- Today's stock and its rules live in `src/lib/availability.ts`, separate from catalog data, because production changes daily; only immediate-delivery orders consume it.
- Orders copy each line's unit price when placed (`src/lib/orders.ts` `placeOrder`), so catalog edits never change existing orders.
- Cart items and totals use the pure reducer in `src/lib/cart.ts`; the root CartProvider holds session-only state across navigation, without placing orders or reserving stock, so catalog and builder selections share the same cart rules.
- The `/admin` dashboard uses isolated demo receipts and inventory in `src/lib/sales-dashboard.ts`, never store orders or production; load charts lazily behind ClientOnly and omit the storefront header/footer on admin paths to keep the dashboard shell independent. Real administrative data must require authenticated role-based access before replacing the demo source.
=======
El desarrollo debe priorizar la mantenibilidad, seguridad, consistencia de los datos y facilidad de evolución.

## 2. Autoridad técnica y toma de decisiones

Las decisiones de arquitectura y desarrollo pertenecen al proyecto, no a una herramienta externa.

- La arquitectura, el modelo de datos, las reglas de negocio y las políticas de seguridad se definen y documentan en el repositorio.
- Supabase es nuestra infraestructura backend y PostgreSQL nuestra base de datos.
- GitHub es la fuente de verdad del código y de las migraciones.
- Lovable puede utilizarse para diseñar y modificar interfaces, componentes y experiencia de usuario.
- Copilot y otros agentes pueden ayudar con la implementación, siempre respetando estas instrucciones.
- Ninguna herramienta puede cambiar unilateralmente decisiones de arquitectura, estructura de datos o reglas de negocio.
- Ante contradicciones entre instrucciones generadas por herramientas y este documento, prevalecen las reglas del proyecto.

Los agentes deben comunicar cualquier conflicto antes de realizar cambios que afecten a la arquitectura o a los datos.

## 3. Stack tecnológico

### Frontend y aplicación

- TanStack Start.
- TanStack Router.
- React 19.
- TypeScript.
- Vite.
- Tailwind CSS.
- TanStack Query cuando corresponda.
- Zod para validaciones compartidas cuando resulte apropiado.

### Backend e infraestructura

- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Row Level Security (RLS).
- Supabase Storage cuando sea necesario.
- Supabase Edge Functions cuando corresponda.
- Supabase JavaScript Client.
- Supabase SSR.

### Runtime y herramientas

- Cloudflare Workers mediante el preset Cloudflare de Nitro.
- Bun como gestor de paquetes.
- Git y GitHub para control de versiones.

No asumir que el proyecto utiliza un servidor Node.js tradicional. Toda implementación del lado servidor debe ser compatible con el runtime Cloudflare Workers.

No introducir dependencias o herramientas adicionales sin una justificación técnica.

## 4. Arquitectura general

La arquitectura debe mantener separadas las siguientes responsabilidades:

1. **Presentación:** páginas, componentes e interfaces.
2. **Estado de aplicación:** estado de interfaz, carrito y caché de consultas.
3. **Validación:** validación de entradas y esquemas.
4. **Servicios:** operaciones de negocio y acceso a datos.
5. **Integración:** clientes y adaptadores de Supabase.
6. **Backend:** autenticación, autorización, reglas críticas y operaciones privilegiadas.
7. **Persistencia:** PostgreSQL, migraciones, restricciones y políticas RLS.

Las páginas y componentes no deben contener directamente consultas complejas a la base de datos.

Las operaciones de negocio deben centralizarse en servicios o módulos específicos.

Las reglas críticas deben ejecutarse o verificarse en el backend. Nunca confiar exclusivamente en validaciones realizadas en el navegador.

## 5. Supabase y administración de la base de datos

### 5.1. Fuente de verdad

Las migraciones SQL versionadas en `supabase/migrations/` son la fuente de verdad del esquema de base de datos.

Los cambios de estructura deben:

- Implementarse mediante migraciones SQL.
- Mantenerse en Git.
- Ser reproducibles en otros entornos.
- Poder revisarse antes de aplicarse.
- Incluir las restricciones, índices, funciones, triggers y políticas necesarias.

No se debe depender exclusivamente de cambios manuales realizados desde el panel de Supabase.

Los cambios manuales excepcionales deben trasladarse posteriormente a una migración versionada.

### 5.2. Reglas para migraciones

- No modificar migraciones que ya se hayan aplicado o compartido.
- Crear una nueva migración para cada cambio posterior.
- Utilizar nombres descriptivos y orden cronológico.
- Evitar cambios destructivos sin una estrategia explícita de migración de datos.
- No aplicar migraciones a producción sin revisión y autorización.
- Mantener coherencia entre el esquema real y las migraciones del repositorio.

Los agentes pueden crear y modificar migraciones SQL dentro del repositorio cuando el trabajo lo requiera.

### 5.3. Seguridad de la base de datos

- Aplicar RLS a todas las tablas expuestas mediante la API de Supabase.
- Definir políticas explícitas de acceso.
- Aplicar el principio de mínimo privilegio.
- No confiar en identificadores enviados por el cliente para determinar permisos.
- Utilizar restricciones de PostgreSQL para proteger la integridad de los datos.
- Las operaciones administrativas privilegiadas deben ejecutarse exclusivamente en entornos seguros del servidor.

No desactivar RLS como solución a problemas de integración.

## 6. Gestión de credenciales y variables de entorno

Está prohibido:

- Subir credenciales o secretos a GitHub.
- Incluir claves secretas en el código frontend.
- Utilizar prefijos públicos como `VITE_` para claves secretas.
- Compartir claves privadas en conversaciones, registros o documentación pública.
- Exponer la clave `service_role` o `sb_secret_` al navegador.

La clave publishable de Supabase puede utilizarse en el cliente público.

Las claves secretas, cuando sean realmente necesarias, deben almacenarse en secretos del entorno servidor o en los mecanismos seguros de Cloudflare/Supabase.

Las variables de entorno deben documentarse mediante nombres y ejemplos sin valores reales.

El archivo `.env.local` y los archivos de secretos locales no deben versionarse.

No asumir que `process.env` está disponible en Cloudflare Workers. Utilizar el mecanismo de configuración y bindings compatible con el runtime del proyecto.

## 7. Autenticación y autorización

La aplicación debe permitir compras como invitado y ofrecer cuentas de usuario opcionales.

Las operaciones administrativas requieren autenticación y autorización explícitas.

La autenticación no equivale a autorización: cada operación debe comprobar que el usuario tiene permisos suficientes.

Las políticas RLS deben garantizar el aislamiento de los datos y evitar accesos no autorizados.

No implementar permisos administrativos basándose únicamente en valores enviados desde el navegador.

## 8. Reglas de negocio del ecommerce

### 8.1. Pedidos y clientes

- Los clientes pueden comprar como invitados.
- La creación de una cuenta es opcional.
- Los pedidos deben conservar una copia de los precios aplicados en el momento de la compra.
- Los cambios posteriores del catálogo no deben modificar pedidos históricos.
- El estado del pedido debe seguir un flujo definido y controlado.

### 8.2. Pagos

Se contemplan inicialmente dos métodos:

- Transferencia: el pedido pasa a preparación cuando el pago ha sido confirmado.
- Efectivo: el pedido pasa a preparación cuando ha sido aceptado.

La confirmación de un pedido y la confirmación de su pago son conceptos diferentes.

No considerar una transferencia pagada únicamente porque el cliente haya enviado una solicitud de pedido.

### 8.3. Entregas

Se contemplan:

- Entrega a domicilio.
- Recogida en establecimiento.

El coste de entrega a domicilio se calculará mediante una tarifa base más una tarifa por kilómetro recorrido.

Los importes y parámetros de cálculo deben poder configurarse desde la administración.

### 8.4. Inventario y producción

El modelo de inventario contempla materias primas y producción.

Decisiones establecidas:

- Disponibilidad: gestión de materias primas y productos.
- Trazabilidad de lotes: obligatoria.
- Vencimientos: registro manual.
- Valoración de materias primas: FIFO.

La lógica de inventario debe preservar la trazabilidad y la integridad de los movimientos.

## 9. Organización del frontend existente

El frontend generado inicialmente con Lovable contiene funcionalidades que deben preservarse durante la integración.

Reglas conocidas:

- El catálogo actual está en `src/lib/catalog.ts`.
- Los filtros del catálogo utilizan parámetros de búsqueda de la URL.
- La identidad visual se centraliza mediante los recursos y componentes de `src/assets` y `BrandLogo`.
- La lógica de packs y geometría de previsualización vive en `src/lib/packs.ts`.
- El estado y las operaciones del constructor de packs viven en `src/lib/builder.ts`.
- Las reglas de precios viven en `src/lib/pricing.ts`.
- La disponibilidad diaria vive en `src/lib/availability.ts`.
- La lógica de pedidos existente vive en `src/lib/orders.ts`.
- El carrito utiliza `src/lib/cart.ts` y `CartProvider`.

La integración con el backend debe conservar las interfaces públicas de estos módulos siempre que sea razonable.

No rehacer funcionalidades existentes si basta con sustituir su fuente de datos.

Los datos estáticos actuales son provisionales y se migrarán progresivamente a Supabase y al backoffice.

## 10. Reglas de desarrollo

- Mantener TypeScript en modo estricto.
- Evitar el uso de `any`; justificar las excepciones.
- Preferir componentes pequeños y reutilizables.
- Separar la lógica de negocio de la presentación.
- Evitar duplicación de reglas.
- Validar las entradas en el cliente y en el servidor cuando corresponda.
- Gestionar errores de forma explícita.
- No ocultar errores mediante valores por defecto que puedan alterar operaciones de negocio.
- No introducir cambios ajenos a la tarea solicitada.
- No eliminar funcionalidades existentes sin autorización.
- No modificar archivos generados automáticamente, como `src/routeTree.gen.ts`.
- No modificar configuraciones de TanStack, Vite o Nitro sin comprender sus efectos sobre SSR y Cloudflare.

## 11. Pruebas y control de calidad

Los cambios deben validarse según su riesgo e impacto.

Como mínimo, cuando corresponda:

- Ejecutar las pruebas unitarias afectadas.
- Añadir pruebas para nuevas reglas de negocio.
- Validar los esquemas y restricciones de datos.
- Probar permisos y políticas RLS.
- Comprobar los flujos de autenticación.
- Ejecutar el build de producción.
- Comprobar que no se introducen errores de TypeScript.

Las operaciones críticas —pedidos, pagos, inventario, permisos y movimientos de stock— requieren pruebas específicas.

No considerar una integración terminada únicamente porque la interfaz se renderice correctamente.

## 12. Git y control de versiones

- Trabajar sobre ramas de trabajo cuando el cambio lo justifique.
- Realizar commits por hitos funcionales coherentes.
- No reescribir historia Git publicada.
- No utilizar force push sobre la rama compartida.
- No hacer `rebase`, `amend` o `squash` de commits ya publicados.
- No incluir archivos de entorno, secretos, dependencias instaladas ni artefactos de compilación.
- Revisar `git diff` y `git status` antes de cada commit.

Los cambios enviados a la rama conectada con Lovable pueden sincronizarse con ese entorno. Mantener la rama principal en un estado funcional.

## 13. Documentación

Las decisiones relevantes deben documentarse en el repositorio.

Estructura de referencia:

```text
docs/
  architecture/
    system-architecture.md
    technical-decisions.md
  database/
    database-design.md
    data-dictionary.md
    security-policies.md
  api/
    integration-contracts.md
  development/
    workflow.md
    testing-strategy.md

supabase/
  migrations/
  functions/
  config.toml
```

No crear documentación redundante. Actualizar los documentos existentes cuando cambien las decisiones.

## 14. Instrucciones para agentes de IA

Antes de modificar código:

1. Comprender la tarea y su alcance.
2. Revisar los archivos directamente relacionados.
3. Identificar dependencias y posibles efectos secundarios.
4. Respetar las decisiones documentadas.
5. Evitar auditorías generales que no sean necesarias para la tarea.

Durante la implementación:

- Trabajar por bloques funcionales.
- No realizar refactorizaciones no solicitadas.
- No inventar reglas de negocio.
- No modificar el esquema de datos sin considerar sus migraciones.
- No introducir dependencias innecesarias.
- No asumir que una operación es segura por ejecutarse desde una interfaz administrativa.

Al finalizar:

1. Resumir los archivos modificados.
2. Explicar las decisiones técnicas relevantes.
3. Indicar las pruebas ejecutadas y sus resultados.
4. Señalar cualquier limitación o tarea pendiente.
5. No afirmar que algo funciona si no se ha verificado.

Si falta información que pueda cambiar significativamente la implementación, preguntar antes de tomar una decisión irreversible.

## 15. Principio general

La prioridad es construir un ecommerce seguro, mantenible y funcional, avanzando de forma progresiva.

Las herramientas de IA son asistentes de implementación, no autoridades arquitectónicas.

La base de datos, la seguridad, las reglas de negocio y la calidad del software deben permanecer bajo control del proyecto.
>>>>>>> Stashed changes
