# Prompt para generar el Sistema de Cuentas por Cobrar (CxC)

Copia y pega todo lo siguiente en la IA que vas a usar para generar el código.

---

Actúa como un ingeniero de software senior full-stack, experto en Next.js (App Router), React, TypeScript, Tailwind CSS y shadcn/ui. Vas a construir desde cero un **Sistema de Cuentas por Cobrar (CxC) con interfaz a Contabilidad**, como proyecto final universitario. Debe verse como un producto real de software empresarial, no como una demo genérica hecha por IA.

## 1. Stack técnico obligatorio

- Next.js 14+ (App Router, Server Components donde aplique)
- React + TypeScript (tipado estricto, sin `any`)
- Tailwind CSS
- shadcn/ui para todos los componentes de interfaz (botones, tablas, diálogos, formularios, inputs, selects, toasts, tabs, badges, etc.)
- Validación de formularios con `zod` + `react-hook-form`
- Persistencia de datos con **Prisma ORM + SQLite** (para que el proyecto corra localmente sin configuración extra de servidor de base de datos). Deja el esquema listo para migrar a PostgreSQL si se requiere.
- Estructura de carpetas limpia, modular, por dominio (feature-based), nunca "todo en un archivo" ni lógica de negocio mezclada con la UI.

## 2. Contexto funcional del sistema

El sistema debe cumplir el siguiente requerimiento (proyecto académico de Cuentas por Cobrar):

Debe gestionar:
1. **Tipos de Documento**
2. **Clientes**
3. **Transacciones** (movimientos de CxC)
4. **Asientos Contables**
5. **Interfaz con el Sistema de Contabilidad** (simulada como un "Web Service" interno que registra el asiento de diario)
6. **Consultas por criterios** (ej. transacciones por cliente, por rango de fechas, por tipo de documento, etc.)

### Entidades y campos mínimos (respeta exactamente estos campos, puedes añadir metadatos como `createdAt`/`updatedAt` pero no elimines ninguno):

**Tipo de Documento**
- Identificador
- Descripción
- Cuenta Contable
- Estado (activo/inactivo)

**Cliente**
- Identificador
- Nombre
- Cédula
- Límite de Crédito
- Estado (activo/inactivo)

**Transacción**
- Identificador de Transacción
- Tipo de Movimiento (DB = Débito, CR = Crédito)
- Identificador de Tipo de Documento (FK)
- Número de Documento
- Fecha
- Identificador del Cliente (FK)
- Monto

**Asiento Contable**
- Identificador de Asiento
- Descripción
- Identificador de Cliente (FK)
- Cuenta
- Tipo de Movimiento (DB, CR)
- Fecha del Asiento
- Monto del Asiento
- Estado

### Reglas de negocio a implementar

- Al registrar una **Transacción**, debe poder generar (o el usuario debe poder generar manualmente desde la transacción) un **Asiento Contable** asociado, simulando el envío a Contabilidad vía un endpoint tipo "Web Service" (`POST /api/contabilidad/asientos`), que reciba el asiento y devuelva un estado de confirmación (ej. `{ status: "REGISTRADO", referencia: "..." }`).
- Validar que el monto de una transacción DB no exceda el **Límite de Crédito disponible** del cliente (crédito límite menos saldo actual de transacciones DB no saldadas), mostrando una advertencia clara si se excede (no bloquees, pero avisa visualmente).
- Los Tipos de Documento y Clientes con Estado "inactivo" no deben poder usarse para crear nuevas transacciones.
- Toda entidad debe soportar CRUD completo (Crear, Leer, Actualizar, Eliminar) con confirmación antes de eliminar.

## 3. Alcance funcional exacto a construir

### CRUDs (cada uno en su propia ruta, con su propia página de listado y formularios en modal o ruta dedicada, tu decides cuál es más limpio, pero sé consistente en todos):

1. `/tipos-documento` — CRUD completo
2. `/clientes` — CRUD completo
3. `/transacciones` — CRUD completo (con selección de cliente y tipo de documento vía combobox de shadcn, botón "Generar Asiento Contable" por transacción)
4. `/asientos-contables` — CRUD completo (de solo lectura desde la UI si prefieres que solo se generen automáticamente desde una transacción, pero permite edición de estado)
5. `/consultas` — Módulo de consulta por criterios: filtros combinables por Cliente, Rango de Fechas, Tipo de Documento, Tipo de Movimiento. Resultado en tabla exportable (botón exportar a CSV es suficiente).
6. `/api/contabilidad/asientos` — Endpoint que simula la interfaz con el sistema de Contabilidad (recibe un asiento, lo valida, y responde con confirmación; regístralo también en la base de datos local como si fuera el "envío").

### Menú / Navegación

- Sidebar lateral fijo y colapsable (usa componentes de shadcn/ui tipo `Sheet`/`NavigationMenu` o un sidebar custom bien hecho) con las secciones:
  - Dashboard (resumen: totales de transacciones, saldo total por cobrar, clientes activos, últimos asientos generados — con 3-4 tarjetas de KPIs y quizás un gráfico simple con `recharts`)
  - Tipos de Documento
  - Clientes
  - Transacciones
  - Asientos Contables
  - Consultas
- Header superior con el nombre del sistema, breadcrumbs de la sección actual, y un ítem de "usuario" (puede ser estático/mock, no se requiere autenticación real a menos que quieras añadir un login simple).
- Diseño responsive: en móvil el sidebar se convierte en menú tipo drawer.

## 4. Lineamientos de diseño (muy importante)

- Diseño **elegante, limpio, profesional y sobrio** — pensado para un sistema contable/financiero real (piensa en la seriedad visual de herramientas como Linear, Mercury o Ramp, no en dashboards de plantilla genérica).
- Evita los clichés típicos de "diseño hecho por IA": nada de gradientes morado-azul por defecto, nada de emojis en la UI de producción, nada de sombras exageradas, nada de bordes redondeados excesivos en todo, nada de tarjetas flotando sin jerarquía.
- Usa una paleta de color contenida (1 color de acento + neutros grises/slate), tipografía consistente (usa la fuente por defecto del sistema o `Inter`), buen uso de espacio en blanco y jerarquía tipográfica clara.
- Tablas de datos densas pero legibles, con paginación, ordenamiento por columna, y estados vacíos bien diseñados (no solo "No hay datos").
- Usa `Badge` de shadcn para estados (Activo/Inactivo, DB/CR, etc.) con colores semánticos coherentes.
- Micro-interacciones sutiles (hover states, transiciones cortas), sin animaciones exageradas.
- Modo oscuro opcional pero recomendado (toggle simple con `next-themes`).

## 5. Calidad de código (no negociable)

- **Cero código espagueti.** Separa claramente:
  - `app/` — rutas y páginas (App Router)
  - `components/` — componentes reutilizables de UI
  - `components/ui/` — componentes generados por shadcn
  - `features/` (o `modules/`) — lógica y componentes específicos de cada dominio (clientes, transacciones, etc.)
  - `lib/` — utilidades, cliente de Prisma, validaciones zod, helpers
  - `server/` o `app/api/` — lógica de servidor / Server Actions
  - `types/` — tipos e interfaces compartidos
  - `prisma/` — schema y migraciones
- Usa **Server Actions** de Next.js para las mutaciones (crear/editar/eliminar) en lugar de solo `fetch` a API routes cuando tenga sentido, y API routes reales solo donde se requiera simular el "Web Service" externo hacia Contabilidad.
- Ningún archivo de página debe superar ~150-200 líneas; si crece más, extrae componentes.
- Nombres de variables, funciones y componentes en inglés (convención de código), pero la interfaz visible para el usuario en **español** (ya que es un sistema para el mercado dominicano/latam).
- Maneja estados de carga (`loading.tsx` o skeletons de shadcn) y estados de error (`error.tsx`, toasts de error) en cada módulo.
- Incluye un archivo `README.md` con instrucciones claras de instalación, cómo correr las migraciones de Prisma y cómo levantar el proyecto (`npm install`, `npx prisma migrate dev`, `npm run dev`).
- Incluye un script de seed (`prisma/seed.ts`) con datos de ejemplo realistas (al menos 5 clientes, 4 tipos de documento, 15-20 transacciones, sus asientos correspondientes) para que el proyecto se vea funcional apenas se instale.

## 6. Entregables esperados

1. Estructura completa del proyecto Next.js funcional.
2. Schema de Prisma con las 4 entidades y sus relaciones.
3. Todos los CRUDs funcionando end-to-end (crear, listar, editar, eliminar, con validaciones).
4. El menú de navegación completo y funcional.
5. El endpoint que simula la interfaz con Contabilidad.
6. El módulo de consultas por criterios.
7. Dashboard inicial con KPIs.
8. README con instrucciones de instalación y ejecución.

Antes de empezar a generar código, primero muéstrame:
- La estructura de carpetas propuesta.
- El schema de Prisma propuesto.

Y espera mi confirmación antes de generar todo el código, para asegurarnos de que la arquitectura esté correcta desde el inicio.
